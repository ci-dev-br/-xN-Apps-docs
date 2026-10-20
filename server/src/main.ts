import { Logger, LoggingInterceptor } from '@ci/core';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter, NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join, dirname, basename, resolve } from 'path';
import { config } from 'dotenv';
import * as express from 'express';
import { spawn, spawnSync } from 'child_process';
import { WsAdapter } from '@nestjs/platform-ws';
import { corsOptionsDelegate } from './cors-option-delegate';
import * as cookieParser from 'cookie-parser';
import { existsSync, readFileSync, writeFileSync, renameSync, watch, FSWatcher } from 'fs';
import * as http from 'http';
import * as inspector from 'inspector';

// Captura se o DEBUG veio explicitamente por linha de comando/ambiente do processo ANTES do .env
const ENV_DEBUG_BEFORE_DOTENV = process.env.DEBUG;

// Inicializa variáveis de ambiente
config();

// Caminho atualizado para __dirname + '/../STATUS'
const STATUS_FILE = join(__dirname, '..', 'STATUS');
const STATUS_DIR = dirname(STATUS_FILE);
const STATUS_FILENAME = basename(STATUS_FILE);
const PROJECT_ROOT = resolve(__dirname, '..');

// Constantes de tempo da Orquestração
const CHECK_DISTANCE_MS = 300;           // Distância padrão de 300ms entre consultas ao STATUS
const IMMEDIATE_MIGRATION_MS = 15;       // Intervalo imediato (15ms) cravado no handoff para migração instantânea
const PORT_86_ROTATION_MS = 10 * 1000;   // Cada nó assume a porta 86 por 10 segundos (se houver outros prontos)
const OLD_PROCESS_PURGE_MS = 60 * 1000;  // Limpa processos inativos há mais de 1 minuto do arquivo STATUS
const ZOMBIE_TIMEOUT_MS = 5 * 1000;      // Tolerância para considerar zombie caso trave sem morrer no SO
const HTTP_WARMUP_TIMEOUT_MS = 1200;     // Timeout do teste HTTP na porta da candidata antes de liberar a 86
const HEALTH_ENDPOINT = '/__orchestration/health';

/**
 * Detecta se a instância atual foi iniciada em modo DEBUG:
 * - Inspector do Node ativo (VSCode Debug / --inspect / --inspect-brk)
 * - Argumentos --debug / --inspect na linha de comando
 * - Variável de ambiente DEBUG passada diretamente para o processo
 */
const IS_DEBUG_INSTANCE = Boolean(
  inspector.url() !== undefined ||
  process.argv.some((arg) => arg === '--debug' || arg.startsWith('--debug=') || arg.startsWith('--inspect')) ||
  process.execArgv.some((arg) => arg.startsWith('--inspect') || arg.startsWith('--debug')) ||
  (ENV_DEBUG_BEFORE_DOTENV && ENV_DEBUG_BEFORE_DOTENV !== 'false' && ENV_DEBUG_BEFORE_DOTENV !== '0') ||
  (process.env.DEBUG === 'true' || process.env.DEBUG === '1')
);

interface ProcessInfo {
  startedAt: string;
  updatedAt?: string;
  lastHeartbeat?: string;
  stoppedAt?: string;
  lastPort86ClaimedAt?: string; // Última data/hora em que o processo assumiu a porta 86
  nextStatusCheckAt?: string;   // Próximo horário programado em que este processo consultará o STATUS
  handoffTargetPid?: string;    // PID da instância já testada via HTTP e autorizada a assumir a 86 imediatamente
  replacedByPid?: number;       // Caso tenha sido derrubado pelo DEBUG, registra o PID da nova instância criada
  warmedUp?: boolean;           // Indica se a instância já respondeu HTTP com sucesso na porta secundária
  status: 'running' | 'online' | 'fail' | 'stopped';
  port?: number;
  previousPort?: number;
  debug?: boolean;
}

type StatusMap = Record<string, ProcessInfo>;

let memoryStatusCache: StatusMap = {};
let scheduledCheckTimer: NodeJS.Timeout | null = null;
let statusWatcher: FSWatcher | null = null;
let globalApp: NestExpressApplication | null = null;
let isChangingPort = false;
let isOrchestrating = false;
let isWarmAndReady = false;
let currentPort86SessionStartMs = 0;
let currentInstancePort: number | undefined;

/**
 * Pausa assíncrona auxiliar.
 */
const sleep = (ms: number) => new Promise<void>((resolvePromise) => setTimeout(resolvePromise, ms));

/**
 * Verifica diretamente no Kernel do Sistema Operacional se um PID ainda existe em execução.
 */
function isOsPidAlive(pid: number | string): boolean {
  const numPid = Number(pid);
  if (!numPid || Number.isNaN(numPid)) return false;
  if (numPid === process.pid) return true;

  try {
    process.kill(numPid, 0);
    return true;
  } catch (err: any) {
    return err?.code === 'EPERM';
  }
}

/**
 * Aciona o nascimento de uma nova instância independente fora do processo atual (`node dist/main.js`).
 * Remove flags de DEBUG/Inspector das variáveis herdadas para que a nova instância suba como nó normal
 * e continue viva em background mesmo quando o DEBUG atual for encerrado.
 */
function spawnReplacementInstance(evictedPid?: string): number | undefined {
  try {
    const cleanEnv: NodeJS.ProcessEnv = { ...process.env };
    delete cleanEnv.DEBUG;

    // Remove flags --inspect / --debug que o VSCode possa ter injetado no NODE_OPTIONS
    if (cleanEnv.NODE_OPTIONS) {
      cleanEnv.NODE_OPTIONS = cleanEnv.NODE_OPTIONS
        .replace(/--inspect(?:-brk|-port)?(?:=\S+)?/g, '')
        .replace(/--debug(?:-brk|-port)?(?:=\S+)?/g, '')
        .trim();
    }

    // Garante que o comando rode a partir da raiz do projeto onde fica a pasta `dist/`
    const workingDir = existsSync(join(process.cwd(), 'dist', 'main.js'))
      ? process.cwd()
      : PROJECT_ROOT;

    const child = spawn('node', ['dist/main.js'], {
      cwd: workingDir,
      detached: true,
      stdio: 'ignore',
      env: cleanEnv,
      windowsHide: true,
    });

    child.unref();

    console.log(
      `[Orquestração] Nova instância de reposição iniciada com "node dist/main.js" (Novo PID: ${child.pid})` +
      (evictedPid ? ` para substituir o PID ${evictedPid} derrubado pelo DEBUG.` : '.')
    );

    return child.pid;
  } catch (err: any) {
    console.error('[Orquestração] Falha ao iniciar nova instância com "node dist/main.js":', err?.message);
    return undefined;
  }
}

/**
 * Realiza uma requisição HTTP na porta da aplicação candidata para garantir que ela
 * já aqueceu completamente e está pronta para responder requisições antes da troca da porta 86.
 */
function verifyCandidateHttpWarmup(port: number, expectedPid?: string): Promise<boolean> {
  return new Promise<boolean>((resolvePromise) => {
    if (!port || port === 86) {
      return resolvePromise(false);
    }

    const req = http.get(
      {
        hostname: '127.0.0.1',
        port,
        path: HEALTH_ENDPOINT,
        timeout: HTTP_WARMUP_TIMEOUT_MS,
        headers: { Connection: 'close' },
      },
      (res) => {
        let rawBody = '';
        res.on('data', (chunk) => {
          rawBody += chunk;
        });
        res.on('end', () => {
          if (res.statusCode === 200 && rawBody) {
            try {
              const parsed = JSON.parse(rawBody);
              if (expectedPid && String(parsed.pid) !== String(expectedPid)) {
                return resolvePromise(false);
              }
              return resolvePromise(parsed.ready === true);
            } catch {
              return resolvePromise(true);
            }
          }
          resolvePromise(Boolean(res.statusCode && res.statusCode > 0 && res.statusCode < 500));
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      resolvePromise(false);
    });

    req.on('error', () => {
      resolvePromise(false);
    });
  });
}

/**
 * Lê o arquivo STATUS do disco.
 */
function readStatus(): StatusMap {
  if (!existsSync(STATUS_FILE)) {
    return memoryStatusCache;
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const raw = readFileSync(STATUS_FILE, 'utf-8').trim();
      if (raw) {
        const parsed = JSON.parse(raw);
        memoryStatusCache = parsed;
        return memoryStatusCache;
      }
    } catch {
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 15);
    }
  }

  return memoryStatusCache;
}

/**
 * Persiste o objeto STATUS completo de forma atômica no disco.
 */
function writeStatusMap(statusMap: StatusMap): StatusMap {
  memoryStatusCache = statusMap;
  const pid = String(process.pid);
  const tempFile = `${STATUS_FILE}.${pid}.tmp`;

  try {
    writeFileSync(tempFile, JSON.stringify(statusMap, null, 2), { encoding: 'utf-8' });
    renameSync(tempFile, STATUS_FILE);
  } catch {
    try {
      writeFileSync(STATUS_FILE, JSON.stringify(statusMap, null, 2), { encoding: 'utf-8' });
    } catch {
      // Ignora colisão momentânea de I/O
    }
  }

  return statusMap;
}

/**
 * Valida se um processo está realmente vivo:
 * 1. Status 'online' ou 'running'
 * 2. PID existe no Sistema Operacional
 * 3. Sinal de vida dentro de ZOMBIE_TIMEOUT_MS
 */
function isProcessTrulyAlive(info: ProcessInfo, now = Date.now(), pid?: string): boolean {
  if (!info || (info.status !== 'online' && info.status !== 'running')) {
    return false;
  }

  if (pid && !isOsPidAlive(pid)) {
    return false;
  }

  const lastBeatStr = info.lastHeartbeat || info.updatedAt || info.startedAt;
  const lastBeatTime = lastBeatStr ? new Date(lastBeatStr).getTime() : 0;

  return (now - lastBeatTime) <= ZOMBIE_TIMEOUT_MS;
}

/**
 * 1. Marca como 'stopped' processos zombies ou que já morreram no SO.
 * 2. Remove definitivamente do objeto STATUS processos parados/antigos há mais de 1 minuto (60s).
 */
function cleanUpZombiesAndPurgeOld(statusMap: StatusMap, now = Date.now()): boolean {
  const currentPid = String(process.pid);
  let changed = false;

  for (const [pid, info] of Object.entries(statusMap)) {
    if (pid === currentPid) continue;

    if ((info.status === 'online' || info.status === 'running') && !isProcessTrulyAlive(info, now, pid)) {
      const lastSeen = info.lastHeartbeat || info.updatedAt || info.startedAt || new Date(now).toISOString();
      statusMap[pid] = {
        ...info,
        status: 'stopped',
        stoppedAt: lastSeen,
        updatedAt: new Date(now).toISOString(),
        nextStatusCheckAt: undefined,
        handoffTargetPid: undefined,
      };
      changed = true;
      console.warn(
        `[STATUS] Processo encerrado/inativo detectado (PID ${pid}${info.debug ? ' [DEBUG]' : ''} na porta ${info.port}). Marcado como 'stopped'.`
      );
    }

    const currentInfo = statusMap[pid];
    if (currentInfo && (currentInfo.status === 'stopped' || currentInfo.status === 'fail')) {
      const refTimeStr = currentInfo.stoppedAt || currentInfo.updatedAt || currentInfo.lastHeartbeat || currentInfo.startedAt;
      const refTimeMs = refTimeStr ? new Date(refTimeStr).getTime() : 0;

      if (now - refTimeMs > OLD_PROCESS_PURGE_MS) {
        delete statusMap[pid];
        changed = true;
      }
    }
  }

  return changed;
}

/**
 * Calcula o próximo horário de consulta ao arquivo STATUS mantendo uma distância de 300ms
 * em relação às consultas agendadas pelos demais processos vivos.
 */
function calculateNextCheckTime(
  statusMap: StatusMap,
  nowMs = Date.now(),
  forceImmediate = false
): { nextIso: string; delayMs: number } {
  const currentPid = String(process.pid);

  if (forceImmediate) {
    const immediateMs = nowMs + IMMEDIATE_MIGRATION_MS;
    return {
      nextIso: new Date(immediateMs).toISOString(),
      delayMs: IMMEDIATE_MIGRATION_MS,
    };
  }

  const existingNextStr = statusMap[currentPid]?.nextStatusCheckAt;
  if (existingNextStr) {
    const existingNextMs = new Date(existingNextStr).getTime();
    const diff = existingNextMs - nowMs;
    if (diff > 0 && diff <= IMMEDIATE_MIGRATION_MS * 3 && statusMap[currentPid]?.handoffTargetPid === currentPid) {
      return {
        nextIso: existingNextStr,
        delayMs: Math.max(5, diff),
      };
    }
  }

  const scheduledTimes = Object.entries(statusMap)
    .filter(([pid, info]) => pid !== currentPid && isProcessTrulyAlive(info, nowMs, pid) && info.nextStatusCheckAt)
    .map(([, info]) => new Date(info.nextStatusCheckAt!).getTime())
    .filter((t) => !Number.isNaN(t) && t > nowMs)
    .sort((a, b) => a - b);

  let candidateMs = nowMs + CHECK_DISTANCE_MS;

  for (const t of scheduledTimes) {
    if (Math.abs(candidateMs - t) < CHECK_DISTANCE_MS) {
      candidateMs = t + CHECK_DISTANCE_MS;
    }
  }

  const delayMs = Math.max(50, candidateMs - nowMs);
  return {
    nextIso: new Date(candidateMs).toISOString(),
    delayMs,
  };
}

/**
 * Salva ou atualiza o status do PID atual, limpa zombies/antigos (> 1 min)
 * e agenda o próximo horário de consulta no STATUS (com 300ms de distância).
 */
function savePidStatus(
  data: Partial<ProcessInfo>,
  startNewProcess = false,
  forceImmediateCheck = false
): { statusMap: StatusMap; nextDelayMs: number } {
  const statusMap = readStatus();
  const pid = String(process.pid);
  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();

  cleanUpZombiesAndPurgeOld(statusMap, nowMs);

  const isStopping = data.status === 'stopped' || data.status === 'fail';
  const { nextIso, delayMs } = isStopping
    ? { nextIso: undefined, delayMs: CHECK_DISTANCE_MS }
    : calculateNextCheckTime(statusMap, nowMs, forceImmediateCheck);

  if (data.port) currentInstancePort = data.port;
  const existing = statusMap[pid];

  if (startNewProcess || !existing) {
    statusMap[pid] = {
      startedAt: nowIso,
      status: 'running',
      debug: IS_DEBUG_INSTANCE,
      warmedUp: isWarmAndReady,
      port: data.port ?? currentInstancePort,
      ...data,
      lastHeartbeat: isStopping ? existing?.lastHeartbeat : nowIso,
      nextStatusCheckAt: nextIso,
      updatedAt: nowIso,
    };
  } else {
    statusMap[pid] = {
      ...existing,
      debug: IS_DEBUG_INSTANCE,
      warmedUp: isWarmAndReady,
      port: data.port ?? currentInstancePort,
      ...data,
      ...(isStopping ? { nextStatusCheckAt: undefined } : { lastHeartbeat: nowIso, nextStatusCheckAt: nextIso }),
      updatedAt: nowIso,
    };
  }

  writeStatusMap(statusMap);
  return { statusMap, nextDelayMs: delayMs };
}

/**
 * Comparador de prioridade para assumir a porta 86:
 * 1º Nó que recebeu o `handoffTargetPid` direto do antigo dono da 86.
 * 2º Instâncias DEBUG têm prioridade sobre instâncias normais.
 * 3º Entre instâncias do mesmo tipo, vence a que está HÁ MAIS TEMPO SEM ASSUMIR A PORTA 86
 *    (menor timestamp em `lastPort86ClaimedAt`, ou `0` se nunca assumiu).
 * 4º Desempate por antiguidade do processo (`startedAt`) e menor `PID`.
 */
function compareProcessPriority(
  [pidA, infoA]: [string, ProcessInfo],
  [pidB, infoB]: [string, ProcessInfo]
): number {
  const handoffA = infoA.handoffTargetPid === pidA;
  const handoffB = infoB.handoffTargetPid === pidB;
  if (handoffA !== handoffB) {
    return handoffA ? -1 : 1;
  }

  const debugA = Boolean(infoA.debug);
  const debugB = Boolean(infoB.debug);

  if (debugA !== debugB) {
    return debugA ? -1 : 1;
  }

  const last86A = infoA.lastPort86ClaimedAt ? new Date(infoA.lastPort86ClaimedAt).getTime() : 0;
  const last86B = infoB.lastPort86ClaimedAt ? new Date(infoB.lastPort86ClaimedAt).getTime() : 0;

  if (last86A !== last86B) {
    return last86A - last86B;
  }

  const startA = new Date(infoA.startedAt).getTime();
  const startB = new Date(infoB.startedAt).getTime();
  if (startA !== startB) {
    return startA - startB;
  }

  return Number(pidA) - Number(pidB);
}

/**
 * Retorna a lista ordenada de processos candidatos (online em outra porta) aptos a assumir a porta 86.
 */
function getSortedCandidatesForPort86(statusMap: StatusMap, nowMs = Date.now()): [string, ProcessInfo][] {
  const currentPid = String(process.pid);
  return Object.entries(statusMap)
    .filter(
      ([pid, info]) =>
        pid !== currentPid &&
        info.status === 'online' &&
        Boolean(info.port) &&
        info.port !== 86 &&
        isProcessTrulyAlive(info, nowMs, pid)
    )
    .sort(compareProcessPriority);
}

/**
 * Quando esta instância está na porta 86, verifica se é hora de passar o bastão para outra instância:
 * - Motivo 1: Surgiu uma instância DEBUG viva (e esta instância atual não é DEBUG).
 * - Motivo 2: Rotação de 10 segundos atingida (e esta instância não é DEBUG).
 *
 * Acessa com HTTP a porta da candidata que pretende pular para a 86 e só retorna se ela responder pronta.
 */
async function findWarmedUpSuccessorForPort86(
  statusMap: StatusMap,
  nowMs = Date.now()
): Promise<[string, ProcessInfo] | null> {
  const currentPid = String(process.pid);
  const myInfo = statusMap[currentPid];

  if (!myInfo || myInfo.status !== 'online' || myInfo.port !== 86) {
    return null;
  }

  if (myInfo.debug) {
    return null;
  }

  const candidates = getSortedCandidatesForPort86(statusMap, nowMs);
  if (candidates.length === 0) {
    return null;
  }

  const hasDebugCandidate = candidates.some(([, info]) => Boolean(info.debug));

  const sessionStart =
    currentPort86SessionStartMs ||
    (myInfo.lastPort86ClaimedAt ? new Date(myInfo.lastPort86ClaimedAt).getTime() : new Date(myInfo.startedAt).getTime());
  const rotationTimeReached = (nowMs - sessionStart) >= PORT_86_ROTATION_MS;

  if (!hasDebugCandidate && !rotationTimeReached) {
    return null;
  }

  const eligibleList = hasDebugCandidate
    ? candidates.filter(([, info]) => Boolean(info.debug))
    : candidates;

  for (const [candPid, candInfo] of eligibleList) {
    if (!candInfo.port) continue;

    // AQUECIMENTO / PROVA HTTP: Acessa via HTTP a porta da candidata que pretende pular para a 86
    const isHttpReady = await verifyCandidateHttpWarmup(candInfo.port, candPid);
    if (isHttpReady) {
      return [candPid, candInfo];
    } else {
      console.log(
        `[Orquestração] Candidata PID ${candPid} (porta ${candInfo.port}) ainda está aquecendo. Mantendo porta 86 ativa neste nó...`
      );
    }
  }

  return null;
}

/**
 * Procura qualquer processo que esteja ocupando a porta 86 no STATUS, derruba-o para assumir
 * e, se esta instância for DEBUG e tiver realmente derrubado um processo vivo,
 * aciona o nascimento de uma nova instância externa via `node dist/main.js`.
 */
function evictPort86OwnerAndSpawnReplacement(statusMap: StatusMap, nowMs = Date.now()): void {
  const currentPid = String(process.pid);
  let changed = false;

  for (const [pid, info] of Object.entries(statusMap)) {
    if (pid === currentPid) continue;

    if (info.port === 86 && (info.status === 'online' || info.status === 'running')) {
      const wasAliveInOs = isOsPidAlive(pid);

      console.warn(
        `[Orquestração] ${IS_DEBUG_INSTANCE ? '[DEBUG] ' : ''}Derrubando instância PID ${pid} que ocupava a porta 86 para assumir...`
      );

      let killedSuccessfully = false;
      if (wasAliveInOs) {
        try {
          process.kill(Number(pid), 'SIGTERM');
          killedSuccessfully = true;
        } catch {
          // Processo já encerrou
        }
      }

      // Se estamos em DEBUG e derrubamos uma instância em execução para assumir a porta 86,
      // acionamos o nascimento de uma nova instância em um novo processo externo com `node dist/main.js`
      let replacementPid: number | undefined;
      if (IS_DEBUG_INSTANCE && (wasAliveInOs || killedSuccessfully)) {
        replacementPid = spawnReplacementInstance(pid);
      }

      statusMap[pid] = {
        ...info,
        status: 'stopped',
        stoppedAt: new Date(nowMs).toISOString(),
        updatedAt: new Date(nowMs).toISOString(),
        nextStatusCheckAt: undefined,
        handoffTargetPid: undefined,
        ...(replacementPid ? { replacedByPid: replacementPid } : {}),
      };
      changed = true;
    }
  }

  if (changed) {
    writeStatusMap(statusMap);
  }
}

/**
 * Determina se ESTA instância (atualmente aquecida em uma porta secundária) deve pular para a porta 86 agora.
 */
async function shouldThisInstanceClaimPort86(statusMap: StatusMap, nowMs = Date.now()): Promise<boolean> {
  const currentPid = String(process.pid);
  const myInfo = statusMap[currentPid];

  if (!myInfo || (myInfo.status !== 'online' && myInfo.status !== 'running') || !myInfo.port || myInfo.port === 86) {
    return false;
  }

  // Confirma que esta própria instância já está aquecida e respondendo HTTP na porta secundária
  if (!isWarmAndReady) {
    isWarmAndReady = await verifyCandidateHttpWarmup(myInfo.port, currentPid);
  }
  if (!isWarmAndReady) {
    return false;
  }

  const currentOwnerEntry = Object.entries(statusMap).find(
    ([pid, info]) => pid !== currentPid && info.port === 86 && isProcessTrulyAlive(info, nowMs, pid)
  );

  // Regra Especial DEBUG:
  // Quando um DEBUG entra e já aqueceu, ele assume a 86.
  // Se o dono atual da 86 não for outro DEBUG, o DEBUG pode assumir imediatamente (via handoff ou derrubando o ocupante e criando outra instância com `node dist/main.js`).
  if (myInfo.debug) {
    if (currentOwnerEntry) {
      const [, ownerInfo] = currentOwnerEntry;
      if (ownerInfo.debug) {
        return false; // Outro DEBUG já é dono da 86
      }
    }

    const aliveDebugCandidates = Object.entries(statusMap)
      .filter(([pid, info]) => (info.status === 'online' || info.status === 'running') && Boolean(info.port) && Boolean(info.debug) && isProcessTrulyAlive(info, nowMs, pid))
      .sort(compareProcessPriority);

    return aliveDebugCandidates.length > 0 && aliveDebugCandidates[0][0] === currentPid;
  }

  // Regra para Nós Normais:
  // 1. Se já há alguém vivo na 86, aguarda o nó da 86 testar nosso HTTP e fazer o handoff
  if (currentOwnerEntry) {
    return false;
  }

  // 2. Se existe qualquer instância DEBUG viva, nós normais não assumem a 86
  const anyAliveDebugExists = Object.entries(statusMap).some(
    ([pid, info]) => Boolean(info.debug) && isProcessTrulyAlive(info, nowMs, pid)
  );
  if (anyAliveDebugExists) {
    return false;
  }

  // 3. Eleição entre nós normais: vence o nó online que está há mais tempo sem assumir a porta 86
  const aliveCandidates = Object.entries(statusMap)
    .filter(([pid, info]) => (info.status === 'online' || info.status === 'running') && Boolean(info.port) && isProcessTrulyAlive(info, nowMs, pid))
    .sort(compareProcessPriority);

  if (aliveCandidates.length === 0 || aliveCandidates[0][0] !== currentPid) {
    return false;
  }

  return true;
}

/**
 * Troca a porta do servidor HTTP subjacente do NestJS com micro-retry rápido.
 */
async function rebindServerPort(newPort: number, maxRetries = 25, retryDelayMs = 30): Promise<void> {
  if (!globalApp) throw new Error('Aplicação NestJS ainda não inicializada.');

  const httpServer: any = globalApp.getHttpServer();
  if (!httpServer) throw new Error('HttpServer não encontrado.');

  if (httpServer.listening) {
    if (typeof httpServer.closeAllConnections === 'function') {
      httpServer.closeAllConnections();
    }
    if (typeof httpServer.closeIdleConnections === 'function') {
      httpServer.closeIdleConnections();
    }
    await new Promise<void>((resolvePromise) => {
      httpServer.close(() => resolvePromise());
    });
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await new Promise<void>((resolvePromise, rejectPromise) => {
        const onError = (err: Error) => {
          httpServer.removeListener('listening', onListening);
          rejectPromise(err);
        };
        const onListening = () => {
          httpServer.removeListener('error', onError);
          resolvePromise();
        };

        httpServer.once('error', onError);
        httpServer.once('listening', onListening);
        httpServer.listen(newPort);
      });
      return;
    } catch (err: any) {
      if (err?.code === 'EADDRINUSE' && attempt < maxRetries) {
        await sleep(retryDelayMs);
        continue;
      }
      throw err;
    }
  }
}

/**
 * Orquestra a troca (Handoff) entre a instância atual na porta 86 e a sucessora já aquecida e testada via HTTP:
 * 1. Libera o socket da porta 86 movendo-se para uma porta secundária livre.
 * 2. Marca no STATUS que a sucessora (`successorPid`) tem um intervalo imediato (`nextStatusCheckAt` = agora + 15ms)
 *    e `handoffTargetPid = successorPid` para pular para a porta 86 instantaneamente.
 */
async function handoffPort86ToSuccessor(successorPid: string, successorPort?: number) {
  if (!globalApp || isChangingPort) return;
  isChangingPort = true;

  const currentPid = String(process.pid);
  let targetSecondaryPort = 0;

  try {
    const statusMap = readStatus();
    do {
      targetSecondaryPort = Math.floor(Math.random() * (65535 - 1024 + 1)) + 1024;
    } while (
      targetSecondaryPort === 86 ||
      targetSecondaryPort === successorPort ||
      !isPortAvailable(targetSecondaryPort, statusMap)
    );

    console.log(
      `[Orquestração] Sucessora PID ${successorPid} (porta ${successorPort}) aprovada no teste HTTP! ` +
      `Liberando porta 86 (PID ${currentPid} -> porta ${targetSecondaryPort}) e agendando migração imediata...`
    );

    await rebindServerPort(targetSecondaryPort, 5, 20);
    currentPort86SessionStartMs = 0;

    const freshMap = readStatus();
    const nowMs = Date.now();
    const nowIso = new Date(nowMs).toISOString();
    const immediateIso = new Date(nowMs + IMMEDIATE_MIGRATION_MS).toISOString();
    const { nextIso: myNextIso } = calculateNextCheckTime(freshMap, nowMs, false);

    if (freshMap[currentPid]) {
      freshMap[currentPid] = {
        ...freshMap[currentPid],
        status: 'online',
        port: targetSecondaryPort,
        previousPort: 86,
        lastPort86ClaimedAt: nowIso,
        lastHeartbeat: nowIso,
        nextStatusCheckAt: myNextIso,
        handoffTargetPid: undefined,
        updatedAt: nowIso,
      };
    }

    if (freshMap[successorPid] && isProcessTrulyAlive(freshMap[successorPid], nowMs, successorPid)) {
      freshMap[successorPid] = {
        ...freshMap[successorPid],
        handoffTargetPid: successorPid,
        nextStatusCheckAt: immediateIso,
        updatedAt: nowIso,
      };
    }

    writeStatusMap(freshMap);

    console.log(
      `[Orquestração] Handoff concluído! Porta 86 livre e migração imediata agendada para PID ${successorPid}.`
    );
  } catch (err: any) {
    console.error(`[Orquestração] Erro durante handoff da porta 86 para a porta ${targetSecondaryPort}:`, err?.message);
    savePidStatus({ status: 'fail', stoppedAt: new Date().toISOString() });
    process.exit(1);
  } finally {
    isChangingPort = false;
  }
}

/**
 * Realiza a migração imediata da instância atual (já aquecida) para a porta 86.
 * Caso a porta 86 esteja em uso quando o DEBUG vai assumir, derruba o processo ocupante
 * e aciona `node dist/main.js` para repor a instância derrubada.
 */
async function migrateToPort86() {
  if (!globalApp || isChangingPort) return;
  isChangingPort = true;

  const currentPid = String(process.pid);
  const statusMap = readStatus();
  const previousPort = statusMap[currentPid]?.port;

  try {
    // Se a porta 86 estiver ocupada no STATUS, derruba o ocupante e (se este for DEBUG) cria uma nova instância `node dist/main.js`
    evictPort86OwnerAndSpawnReplacement(statusMap);

    const claimIso = new Date().toISOString();

    // 1. Reserva a porta 86 no STATUS registrando a data em que assumiu (lastPort86ClaimedAt)
    savePidStatus({
      status: 'running',
      port: 86,
      previousPort,
      lastPort86ClaimedAt: claimIso,
      handoffTargetPid: undefined,
    });

    // 2. Confirma que não houve colisão de escrita
    const verifyMap = readStatus();
    const conflictingPids = Object.entries(verifyMap).filter(
      ([pid, info]) => pid !== currentPid && info.port === 86 && isProcessTrulyAlive(info, Date.now(), pid)
    );

    if (conflictingPids.length > 0) {
      const allOn86 = [
        [currentPid, verifyMap[currentPid]] as [string, ProcessInfo],
        ...conflictingPids,
      ].sort(compareProcessPriority);

      if (allOn86[0][0] !== currentPid) {
        console.log(
          `[Orquestração] Outra instância (${allOn86[0][0]}) teve prioridade na porta 86. Mantendo porta ${previousPort}.`
        );
        savePidStatus({ status: 'online', port: previousPort, handoffTargetPid: undefined });
        return;
      }
    }

    console.log(
      `[Orquestração] Pulando para a porta 86 (já aquecida) -> ${IS_DEBUG_INSTANCE ? '[DEBUG] ' : ''}(PID ${currentPid}, vindo da porta ${previousPort})...`
    );

    // 3. Troca o listener do servidor HTTP da porta de aquecimento para a porta 86
    await rebindServerPort(86, 25, 30);

    const nowMs = Date.now();
    currentPort86SessionStartMs = nowMs;

    savePidStatus({
      status: 'online',
      port: 86,
      lastPort86ClaimedAt: new Date(nowMs).toISOString(),
      handoffTargetPid: undefined,
    });

    console.log(
      `[Orquestração] Aplicação ${IS_DEBUG_INSTANCE ? '[DEBUG] ' : ''}(PID ${currentPid}) assumiu a porta 86 com sucesso!`
    );
  } catch (err: any) {
    console.error(
      `[Orquestração] Falha ao migrar para a porta 86 (${err?.message}). Retornando para porta ${previousPort}...`
    );
    try {
      if (previousPort && previousPort !== 86) {
        await rebindServerPort(previousPort, 5, 30);
        savePidStatus({ status: 'online', port: previousPort, handoffTargetPid: undefined });
      }
    } catch (fallbackErr) {
      console.error('[Orquestração] Erro crítico ao retornar para porta anterior:', fallbackErr);
      savePidStatus({ status: 'fail', stoppedAt: new Date().toISOString() });
      process.exit(1);
    }
  } finally {
    isChangingPort = false;
  }
}

/**
 * Ciclo programado de leitura e orquestração do STATUS.
 */
async function runScheduledStatusCycle() {
  if (scheduledCheckTimer) {
    clearTimeout(scheduledCheckTimer);
    scheduledCheckTimer = null;
  }

  let nextDelayMs = CHECK_DISTANCE_MS;

  if (!isChangingPort && !isOrchestrating) {
    isOrchestrating = true;
    try {
      const { statusMap, nextDelayMs: calculatedDelay } = savePidStatus({});
      nextDelayMs = calculatedDelay;

      if (globalApp) {
        const nowMs = Date.now();
        const currentPid = String(process.pid);
        const myInfo = statusMap[currentPid];

        if (myInfo?.port === 86) {
          // Está na porta 86: verifica se há outra instância (DEBUG ou rotação 10s),
          // testa a porta dela via HTTP e, se ela responder pronta, executa a troca!
          const successor = await findWarmedUpSuccessorForPort86(statusMap, nowMs);
          if (successor) {
            const [successorPid, successorInfo] = successor;
            await handoffPort86ToSuccessor(successorPid, successorInfo.port);
          }
        } else {
          // Está em outra porta: verifica se deve assumir a 86 (ou derrubar o ocupante se este for DEBUG aquecido)
          const canClaim = await shouldThisInstanceClaimPort86(statusMap, nowMs);
          if (canClaim) {
            await migrateToPort86();
          }
        }
      }
    } catch (err) {
      console.error('[STATUS] Erro no ciclo programado do STATUS:', err);
    } finally {
      isOrchestrating = false;
    }
  }

  if (!isShuttingDown) {
    scheduledCheckTimer = setTimeout(() => {
      runScheduledStatusCycle();
    }, nextDelayMs);
    scheduledCheckTimer.unref();
  }
}

/**
 * Monitora o arquivo STATUS para reagir instantaneamente quando o nó da porta 86
 * agendar um Handoff imediato (`handoffTargetPid === meu_pid`) ou quando um DEBUG ficar online.
 */
function startStatusWatcher() {
  if (statusWatcher) {
    statusWatcher.close();
    statusWatcher = null;
  }

  try {
    if (existsSync(STATUS_DIR)) {
      statusWatcher = watch(STATUS_DIR, (_eventType, filename) => {
        if (filename !== STATUS_FILENAME || isChangingPort || isOrchestrating || !globalApp) return;

        const currentPid = String(process.pid);
        const statusMap = readStatus();
        const myInfo = statusMap[currentPid];

        if (!myInfo || myInfo.status !== 'online') return;

        if (myInfo.port !== 86 && myInfo.handoffTargetPid === currentPid) {
          if (scheduledCheckTimer) clearTimeout(scheduledCheckTimer);
          scheduledCheckTimer = setTimeout(() => runScheduledStatusCycle(), IMMEDIATE_MIGRATION_MS);
          return;
        }

        if (myInfo.port === 86 && !myInfo.debug) {
          const debugJustArrived = Object.entries(statusMap).some(
            ([pid, info]) =>
              pid !== currentPid &&
              Boolean(info.debug) &&
              info.status === 'online' &&
              info.port !== 86 &&
              isProcessTrulyAlive(info, Date.now(), pid)
          );
          if (debugJustArrived) {
            if (scheduledCheckTimer) clearTimeout(scheduledCheckTimer);
            scheduledCheckTimer = setTimeout(() => runScheduledStatusCycle(), IMMEDIATE_MIGRATION_MS);
          }
        }
      });
      statusWatcher.unref();
    }
  } catch {
    // Fallback garantido pelo ciclo programado de 300ms
  }
}

/**
 * Verifica se uma porta secundária está disponível.
 * Regra: Nenhuma aplicação deve levantar inicialmente na porta 86.
 */
function isPortAvailable(port: number, statusMap: StatusMap): boolean {
  if (port === 86) {
    return false;
  }

  const currentPid = String(process.pid);
  const now = Date.now();

  cleanUpZombiesAndPurgeOld(statusMap, now);

  const entriesOnPort = Object.entries(statusMap).filter(
    ([pid, info]) => pid !== currentPid && info.port === port
  );

  if (entriesOnPort.length === 0) {
    return true;
  }

  const isSomeoneAliveOnPort = entriesOnPort.some(([pid, info]) => isProcessTrulyAlive(info, now, pid));
  return !isSomeoneAliveOnPort;
}

/**
 * Sorteia sempre uma porta secundária livre (nunca a 86) para a aplicação levantar e aquecer primeiro.
 */
function getInitialWarmupPort(preferredPort?: number): number {
  const statusMap = readStatus();

  if (preferredPort && preferredPort !== 86 && isPortAvailable(preferredPort, statusMap)) {
    return preferredPort;
  }

  let candidatePort: number;
  do {
    candidatePort = Math.floor(Math.random() * (65535 - 1024 + 1)) + 1024;
  } while (candidatePort === 86 || !isPortAvailable(candidatePort, statusMap));

  return candidatePort;
}

/**
 * Monitora o encerramento da aplicação para cancelar os timers e atualizar o STATUS.
 */
let isShuttingDown = false;
function handleExit() {
  if (isShuttingDown) return;
  isShuttingDown = true;

  if (scheduledCheckTimer) {
    clearTimeout(scheduledCheckTimer);
    scheduledCheckTimer = null;
  }
  if (statusWatcher) {
    statusWatcher.close();
    statusWatcher = null;
  }

  try {
    const statusMap = readStatus();
    const current = statusMap[process.pid];
    const finalStatus = current?.status === 'fail' ? 'fail' : 'stopped';

    savePidStatus({
      status: finalStatus,
      stoppedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Erro ao registrar encerramento no STATUS:', err);
  }
}

// 1. Nasce o processo: registra no STATUS como 'running' e inicia o agendamento programado (300ms)
let STATUS = savePidStatus({ status: 'running', debug: IS_DEBUG_INSTANCE }, true).statusMap;
startStatusWatcher();
runScheduledStatusCycle();

process.on('exit', () => handleExit());
process.on('SIGINT', () => { handleExit(); process.exit(0); });
process.on('SIGTERM', () => { handleExit(); process.exit(0); });
process.on('SIGHUP', () => { handleExit(); process.exit(0); });
process.on('SIGBREAK', () => { handleExit(); process.exit(0); });

new Logger(console);

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

/**
 * Inicia a aplicação sempre em uma porta secundária de aquecimento, testa sua resposta HTTP
 * e só então marca como 'online' e apta a assumir a porta 86.
 */
async function startApplication(app: NestExpressApplication, warmupPort: number) {
  try {
    globalApp = app;
    app.useWebSocketAdapter(new WsAdapter(app));

    savePidStatus({ status: 'running', port: warmupPort, warmedUp: false });

    await app.listen(warmupPort, async () => {
      console.log(
        `[Warmup] Aplicação ${IS_DEBUG_INSTANCE ? '[DEBUG] ' : ''}(PID ${process.pid}) levantou na porta secundária ${warmupPort}. Testando prontidão HTTP...`
      );

      for (let attempt = 0; attempt < 10; attempt++) {
        const ready = await verifyCandidateHttpWarmup(warmupPort, String(process.pid));
        if (ready) {
          isWarmAndReady = true;
          break;
        }
        await sleep(50);
      }

      isWarmAndReady = true;

      STATUS = savePidStatus(
        {
          status: 'online',
          port: warmupPort,
          warmedUp: true,
        },
        false,
        true
      ).statusMap;

      console.log(
        `Non-Secure HTTP Application ${IS_DEBUG_INSTANCE ? '[DEBUG] ' : ''}is Warmed Up & Online on port ${warmupPort}`
      );

      // Dispara imediatamente a tomada da porta 86 (se for DEBUG, já derruba quem estiver na 86 e sobe `node dist/main.js`)
      runScheduledStatusCycle();
    });
  } catch (error: any) {
    try {
      if (error.code === 'EADDRINUSE') {
        console.warn(`Warmup port ${warmupPort} in use. Picking another port...`);
        const newWarmupPort = getInitialWarmupPort();
        await startApplication(app, newWarmupPort);
      } else {
        console.trace('[Falha ao iniciar serviços]');
        console.trace(error);
        STATUS = savePidStatus({
          status: 'fail',
          stoppedAt: new Date().toISOString(),
        }).statusMap;
        process.exit(1);
      }
    } catch (innerError) {
      console.trace(innerError);
    }
  }
}

/**
 * Função principal de inicialização (Bootstrap) da aplicação NestJS.
 */
async function bootstrap() {
  const server = express();

  // Endpoint leve de Health/Warmup usado para testar via HTTP se a aplicação já está pronta e aquecida
  server.get(HEALTH_ENDPOINT, (_req, res) => {
    res.status(200).json({
      ok: true,
      ready: true,
      pid: process.pid,
      debug: IS_DEBUG_INSTANCE,
      timestamp: new Date().toISOString(),
    });
  });

  const envPort = Number(process.env.PORT);
  const initialWarmupPort = getInitialWarmupPort(envPort && envPort !== 86 ? envPort : undefined);

  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(server),
    {
      bodyParser: false,
    },
  );

  app.set('trust proxy', 'loopback');
  app.use(cookieParser());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  app.enableCors(corsOptionsDelegate);

  const options = new DocumentBuilder()
    .setTitle('Apps CiDevBr')
    .setDescription('Apps API')
    .setVersion('1.0.1')
    .addTag('@apps')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
  app.useGlobalInterceptors(new LoggingInterceptor());

  await startApplication(app, initialWarmupPort);
}

try {
  bootstrap().catch((err) => {
    console.trace('[Bootstrap Error]', err);
  });
} catch (error) {
  console.trace('[Fatal Error]', error);
}