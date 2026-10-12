import { Logger, LoggingInterceptor } from '@ci/core';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter, NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { config } from 'dotenv';
import * as express from 'express';
import { spawnSync } from 'child_process';
import { WsAdapter } from '@nestjs/platform-ws';
import { corsOptionsDelegate } from './cors-option-delegate';
import * as cookieParser from 'cookie-parser';
import { existsSync, readFileSync, writeFileSync, renameSync } from 'fs';
import * as inspector from 'inspector';

// Captura se o DEBUG veio explicitamente por linha de comando/ambiente do processo ANTES do .env
const ENV_DEBUG_BEFORE_DOTENV = process.env.DEBUG;

// Inicializa variáveis de ambiente
config();

// Caminho atualizado para __dirname + '/../STATUS'
const STATUS_FILE = join(__dirname, '..', 'STATUS');

// Constantes de tempo da Orquestração
const CHECK_DISTANCE_MS = 300;           // Distância de 300ms entre consultas ao STATUS
const PORT_86_ROTATION_MS = 10 * 1000;   // Cada nó assume a porta 86 por 10 segundos (se houver outros)
const OLD_PROCESS_PURGE_MS = 60 * 1000;  // Limpa processos inativos há mais de 1 minuto do arquivo STATUS
const ZOMBIE_TIMEOUT_MS = 5 * 1000;      // Tolerância para considerar zombie caso trave sem morrer no SO

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
  status: 'running' | 'online' | 'fail' | 'stopped';
  port?: number;
  previousPort?: number;
  debug?: boolean;
}

type StatusMap = Record<string, ProcessInfo>;

let memoryStatusCache: StatusMap = {};
let scheduledCheckTimer: NodeJS.Timeout | null = null;
let globalApp: NestExpressApplication | null = null;
let isChangingPort = false;
let isOrchestrating = false;
let currentPort86SessionStartMs = 0; // Momento exato em que o turno atual na porta 86 começou

/**
 * Pausa assíncrona auxiliar.
 */
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

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

    // A) Detecta se o processo morreu ou virou zombie
    if ((info.status === 'online' || info.status === 'running') && !isProcessTrulyAlive(info, now, pid)) {
      const lastSeen = info.lastHeartbeat || info.updatedAt || info.startedAt || new Date(now).toISOString();
      statusMap[pid] = {
        ...info,
        status: 'stopped',
        stoppedAt: lastSeen,
        updatedAt: new Date(now).toISOString(),
      };
      changed = true;
      console.warn(
        `[STATUS] Processo encerrado/inativo detectado (PID ${pid}${info.debug ? ' [DEBUG]' : ''} na porta ${info.port}). Marcado como 'stopped'.`
      );
    }

    // B) Expurga processos inativos ('stopped' ou 'fail') com mais de 1 minuto
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
function calculateNextCheckTime(statusMap: StatusMap, nowMs = Date.now()): { nextIso: string; delayMs: number } {
  const currentPid = String(process.pid);

  // Coleta todos os agendamentos futuros dos outros processos vivos
  const scheduledTimes = Object.entries(statusMap)
    .filter(([pid, info]) => pid !== currentPid && isProcessTrulyAlive(info, nowMs, pid) && info.nextStatusCheckAt)
    .map(([, info]) => new Date(info.nextStatusCheckAt!).getTime())
    .filter((t) => !Number.isNaN(t) && t > nowMs)
    .sort((a, b) => a - b);

  // Começa propondo 300ms a partir de agora
  let candidateMs = nowMs + CHECK_DISTANCE_MS;

  // Se houver conflito (menos de 300ms de distância de outro agendamento), empurra em saltos de 300ms
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
function savePidStatus(data: Partial<ProcessInfo>, startNewProcess = false): { statusMap: StatusMap; nextDelayMs: number } {
  const statusMap = readStatus();
  const pid = String(process.pid);
  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();

  cleanUpZombiesAndPurgeOld(statusMap, nowMs);

  const isStopping = data.status === 'stopped' || data.status === 'fail';
  const { nextIso, delayMs } = isStopping
    ? { nextIso: undefined, delayMs: CHECK_DISTANCE_MS }
    : calculateNextCheckTime(statusMap, nowMs);

  const existing = statusMap[pid];

  if (startNewProcess || !existing) {
    statusMap[pid] = {
      startedAt: nowIso,
      status: 'running',
      debug: IS_DEBUG_INSTANCE,
      ...data,
      lastHeartbeat: isStopping ? existing?.lastHeartbeat : nowIso,
      nextStatusCheckAt: nextIso,
      updatedAt: nowIso,
    };
  } else {
    statusMap[pid] = {
      ...existing,
      debug: IS_DEBUG_INSTANCE,
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
 * 1º Instâncias DEBUG têm prioridade absoluta.
 * 2º Entre instâncias do mesmo tipo, vence a que está HÁ MAIS TEMPO SEM ASSUMIR A PORTA 86
 *    (menor timestamp em `lastPort86ClaimedAt`, ou `0` se nunca assumiu).
 * 3º Desempate por antiguidade do processo (`startedAt`) e menor `PID`.
 */
function compareProcessPriority(
  [pidA, infoA]: [string, ProcessInfo],
  [pidB, infoB]: [string, ProcessInfo]
): number {
  const debugA = Boolean(infoA.debug);
  const debugB = Boolean(infoB.debug);

  if (debugA !== debugB) {
    return debugA ? -1 : 1;
  }

  const last86A = infoA.lastPort86ClaimedAt ? new Date(infoA.lastPort86ClaimedAt).getTime() : 0;
  const last86B = infoB.lastPort86ClaimedAt ? new Date(infoB.lastPort86ClaimedAt).getTime() : 0;

  if (last86A !== last86B) {
    return last86A - last86B; // Mais antigo (ou nunca assumiu = 0) vence
  }

  const startA = new Date(infoA.startedAt).getTime();
  const startB = new Date(infoB.startedAt).getTime();
  if (startA !== startB) {
    return startA - startB;
  }

  return Number(pidA) - Number(pidB);
}

/**
 * Procura e derruba imediatamente qualquer outro processo que esteja ocupando a porta 86 no STATUS,
 * para que a instância prioritária (especialmente DEBUG) possa assumir sem espera.
 */
function forceEvictPort86Owner(statusMap: StatusMap, nowMs = Date.now()): void {
  const currentPid = String(process.pid);
  let changed = false;

  for (const [pid, info] of Object.entries(statusMap)) {
    if (pid === currentPid) continue;

    if (info.port === 86 && (info.status === 'online' || info.status === 'running')) {
      console.warn(`[Orquestração] Derrubando processo PID ${pid} que ocupava a porta 86 para assumir...`);

      try {
        process.kill(Number(pid), 'SIGTERM');
      } catch {
        // Processo já não existia ou sem permissão
      }

      statusMap[pid] = {
        ...info,
        status: 'stopped',
        stoppedAt: new Date(nowMs).toISOString(),
        updatedAt: new Date(nowMs).toISOString(),
      };
      changed = true;
    }
  }

  if (changed) {
    writeStatusMap(statusMap);
  }
}

/**
 * Verifica se esta instância que está na porta 86 deve abrir mão dela:
 * - Caso 1: Esta instância NÃO é DEBUG e surgiu uma instância DEBUG viva.
 * - Caso 2 (Rotação de 10s): Esta instância NÃO é DEBUG, existem outros nós 'online' vivos,
 *   e o tempo de posse atual na porta 86 já atingiu 10 segundos (PORT_86_ROTATION_MS).
 */
function shouldRelinquishPort86(statusMap: StatusMap, nowMs = Date.now()): boolean {
  const currentPid = String(process.pid);
  const myInfo = statusMap[currentPid];

  if (!myInfo || myInfo.status !== 'online' || myInfo.port !== 86) {
    return false;
  }

  // DEBUG sempre tem prioridade e mantém a porta 86 enquanto estiver ativo
  if (myInfo.debug) {
    return false;
  }

  // 1. Se entrou qualquer DEBUG vivo, cede imediatamente
  const anyDebugAlive = Object.entries(statusMap).some(
    ([pid, info]) => pid !== currentPid && Boolean(info.debug) && isProcessTrulyAlive(info, nowMs, pid)
  );
  if (anyDebugAlive) {
    return true;
  }

  // 2. Verifica se existem outros nós online para rotacionar a cada 10 segundos
  const otherOnlineNodes = Object.entries(statusMap).filter(
    ([pid, info]) => pid !== currentPid && info.status === 'online' && isProcessTrulyAlive(info, nowMs, pid)
  );

  if (otherOnlineNodes.length === 0) {
    // Único nó ativo: continua na porta 86
    return false;
  }

  const sessionStart =
    currentPort86SessionStartMs ||
    (myInfo.lastPort86ClaimedAt ? new Date(myInfo.lastPort86ClaimedAt).getTime() : new Date(myInfo.startedAt).getTime());

  return (nowMs - sessionStart) >= PORT_86_ROTATION_MS;
}

/**
 * Determina se ESTA instância (atualmente fora da porta 86) deve assumir a porta 86 agora.
 */
function shouldThisInstanceClaimPort86(statusMap: StatusMap, nowMs = Date.now()): boolean {
  const currentPid = String(process.pid);
  const myInfo = statusMap[currentPid];

  if (!myInfo || myInfo.status !== 'online' || myInfo.port === 86) {
    return false;
  }

  const currentOwnerEntry = Object.entries(statusMap).find(
    ([pid, info]) => pid !== currentPid && info.port === 86 && isProcessTrulyAlive(info, nowMs, pid)
  );

  // Regra Especial DEBUG: Se esta instância é DEBUG, ela pode assumir mesmo que a 86 esteja ocupada por um nó normal
  // (ou se ela for a DEBUG mais prioritária e a 86 estiver livre)
  if (myInfo.debug) {
    if (currentOwnerEntry) {
      const [, ownerInfo] = currentOwnerEntry;
      // Se quem está na 86 já é outro DEBUG, respeita ele; se for nó normal, o DEBUG vai derrubar e assumir!
      if (ownerInfo.debug) {
        return false;
      }
    }

    const aliveDebugCandidates = Object.entries(statusMap)
      .filter(([pid, info]) => info.status === 'online' && Boolean(info.debug) && isProcessTrulyAlive(info, nowMs, pid))
      .sort(compareProcessPriority);

    return aliveDebugCandidates.length > 0 && aliveDebugCandidates[0][0] === currentPid;
  }

  // Regra para Nós Normais:
  // 1. Se a porta 86 já está ocupada por alguém vivo, aguarda a rotação de 10s
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
    .filter(([pid, info]) => info.status === 'online' && isProcessTrulyAlive(info, nowMs, pid))
    .sort(compareProcessPriority);

  if (aliveCandidates.length === 0) {
    return false;
  }

  return aliveCandidates[0][0] === currentPid;
}

/**
 * Troca a porta do servidor HTTP subjacente do NestJS com micro-retry rápido.
 */
async function rebindServerPort(newPort: number, maxRetries = 25, retryDelayMs = 40): Promise<void> {
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
    await new Promise<void>((resolve) => {
      httpServer.close(() => resolve());
    });
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await new Promise<void>((resolve, reject) => {
        const onError = (err: Error) => {
          httpServer.removeListener('listening', onListening);
          reject(err);
        };
        const onListening = () => {
          httpServer.removeListener('error', onError);
          resolve();
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
 * Libera a porta 86 (após os 10s de turno ou quando um DEBUG entra) e vai para uma porta secundária livre,
 * registrando o timestamp final de `lastPort86ClaimedAt` para ir para o fim da fila de rotação.
 */
async function relinquishPort86() {
  if (!globalApp || isChangingPort) return;
  isChangingPort = true;

  const currentPid = String(process.pid);
  let targetPort = 0;

  try {
    const statusMap = readStatus();
    do {
      targetPort = Math.floor(Math.random() * (65535 - 1024 + 1)) + 1024;
    } while (targetPort === 86 || !isPortAvailable(targetPort, statusMap));

    console.log(
      `[Orquestração] Rotacionando/Cedendo porta 86 (PID ${currentPid}) -> indo para porta secundária ${targetPort}...`
    );

    await rebindServerPort(targetPort, 5, 20);
    currentPort86SessionStartMs = 0;

    // Atualiza lastPort86ClaimedAt no momento da saída para que este nó seja considerado o mais recente a ter usado a 86
    savePidStatus({
      status: 'online',
      port: targetPort,
      previousPort: 86,
      lastPort86ClaimedAt: new Date().toISOString(),
    });

    console.log(
      `[Orquestração] Porta 86 liberada para o próximo nó da fila! Instância (PID ${currentPid}) online na porta ${targetPort}.`
    );
  } catch (err: any) {
    console.error(`[Orquestração] Erro ao liberar a porta 86 para a porta ${targetPort}:`, err?.message);
    savePidStatus({ status: 'fail', stoppedAt: new Date().toISOString() });
    process.exit(1);
  } finally {
    isChangingPort = false;
  }
}

/**
 * Assume a porta 86. Caso a porta 86 esteja em uso no STATUS, localiza o processo dono e o derruba antes de assumir.
 */
async function migrateToPort86() {
  if (!globalApp || isChangingPort) return;
  isChangingPort = true;

  const currentPid = String(process.pid);
  const statusMap = readStatus();
  const previousPort = statusMap[currentPid]?.port;

  try {
    // Se a porta 86 estiver ocupada no STATUS (ex: DEBUG entrando ou nó anterior travado), derruba o ocupante
    forceEvictPort86Owner(statusMap);

    const claimIso = new Date().toISOString();

    // 1. Reserva a porta 86 no STATUS registrando a data em que assumiu (lastPort86ClaimedAt)
    savePidStatus({
      status: 'running',
      port: 86,
      previousPort,
      lastPort86ClaimedAt: claimIso,
    });

    // 2. Confirma que não houve colisão com outro nó de maior prioridade no mesmo instante
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
        savePidStatus({ status: 'online', port: previousPort });
        return;
      }
    }

    console.log(
      `[Orquestração] Assumindo porta 86 -> ${IS_DEBUG_INSTANCE ? '[DEBUG] ' : ''}(PID ${currentPid}, vindo da porta ${previousPort})...`
    );

    // 3. Faz o bind na porta 86
    await rebindServerPort(86, 25, 40);

    const nowMs = Date.now();
    currentPort86SessionStartMs = nowMs;

    savePidStatus({
      status: 'online',
      port: 86,
      lastPort86ClaimedAt: new Date(nowMs).toISOString(),
    });

    console.log(
      `[Orquestração] Aplicação ${IS_DEBUG_INSTANCE ? '[DEBUG] ' : ''}(PID ${currentPid}) assumiu a porta 86 em ${new Date(nowMs).toISOString()}!`
    );
  } catch (err: any) {
    console.error(
      `[Orquestração] Falha ao migrar para a porta 86 (${err?.message}). Retornando para porta ${previousPort}...`
    );
    try {
      if (previousPort && previousPort !== 86) {
        await rebindServerPort(previousPort, 5, 40);
        savePidStatus({ status: 'online', port: previousPort });
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
 * Cada execução grava o `nextStatusCheckAt` no arquivo STATUS (com espaçamento de 300ms)
 * e agenda exatamente o próximo timeout.
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
      // Atualiza heartbeat, limpa processos > 1 min e agenda o próximo horário (+300ms de distância)
      const { statusMap, nextDelayMs: calculatedDelay } = savePidStatus({});
      nextDelayMs = calculatedDelay;

      if (globalApp) {
        const nowMs = Date.now();

        if (shouldRelinquishPort86(statusMap, nowMs)) {
          await relinquishPort86();
        } else if (shouldThisInstanceClaimPort86(statusMap, nowMs)) {
          await migrateToPort86();
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
 * Verifica disponibilidade de uma porta na inicialização.
 */
function isPortAvailable(port: number, statusMap: StatusMap): boolean {
  const currentPid = String(process.pid);
  const now = Date.now();

  cleanUpZombiesAndPurgeOld(statusMap, now);

  // Se uma instância DEBUG está iniciando na porta 86 e há apenas um nó comum nela,
  // derruba o nó comum para permitir que o DEBUG assuma diretamente a 86.
  if (port === 86 && IS_DEBUG_INSTANCE) {
    const debugOwner = Object.entries(statusMap).find(
      ([pid, info]) => pid !== currentPid && info.port === 86 && Boolean(info.debug) && isProcessTrulyAlive(info, now, pid)
    );
    if (debugOwner) {
      return false; // Outro DEBUG já está na 86
    }

    forceEvictPort86Owner(statusMap, now);
    return true;
  }

  if (port === 86 && !IS_DEBUG_INSTANCE) {
    const anyAliveDebug = Object.entries(statusMap).some(
      ([pid, info]) => pid !== currentPid && Boolean(info.debug) && isProcessTrulyAlive(info, now, pid)
    );
    if (anyAliveDebug) {
      return false;
    }
  }

  const entriesOnPort = Object.entries(statusMap).filter(
    ([pid, info]) => pid !== currentPid && info.port === port
  );

  if (entriesOnPort.length === 0) {
    return true;
  }

  // Porta é considerada ocupada apenas se houver um processo vivo nela
  const isSomeoneAliveOnPort = entriesOnPort.some(([pid, info]) => isProcessTrulyAlive(info, now, pid));
  return !isSomeoneAliveOnPort;
}

/**
 * Retorna a porta preferencial (ex: 86) se disponível, ou sorteia uma porta livre.
 */
function getNextAvailablePort(preferredPort: number): number {
  const statusMap = readStatus();

  if (isPortAvailable(preferredPort, statusMap)) {
    return preferredPort;
  }

  let candidatePort: number;
  do {
    candidatePort = Math.floor(Math.random() * (65535 - 1024 + 1)) + 1024;
  } while (candidatePort === 86 || !isPortAvailable(candidatePort, statusMap));

  return candidatePort;
}

/**
 * Monitora o encerramento da aplicação para cancelar o agendamento e atualizar o STATUS.
 */
let isShuttingDown = false;
function handleExit() {
  if (isShuttingDown) return;
  isShuttingDown = true;

  if (scheduledCheckTimer) {
    clearTimeout(scheduledCheckTimer);
    scheduledCheckTimer = null;
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

// 1. Nasce o processo: registra no STATUS e inicia o ciclo programado de 300ms
let STATUS = savePidStatus({ status: 'running', debug: IS_DEBUG_INSTANCE }, true).statusMap;
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
 * Tenta iniciar a aplicação na porta especificada.
 */
async function startApplication(app: NestExpressApplication, port: number) {
  try {
    globalApp = app;
    app.useWebSocketAdapter(new WsAdapter(app));

    savePidStatus({ status: 'running', port });

    await app.listen(port, () => {
      const nowMs = Date.now();
      const nowIso = new Date(nowMs).toISOString();

      if (port === 86) {
        currentPort86SessionStartMs = nowMs;
      }

      STATUS = savePidStatus({
        status: 'online',
        port,
        ...(port === 86 ? { lastPort86ClaimedAt: nowIso } : {}),
      }).statusMap;

      console.log(
        `Non-Secure HTTP Application ${IS_DEBUG_INSTANCE ? '[DEBUG] ' : ''}is Running on port ${port}`
      );

      // Dispara avaliação imediata assim que fica online
      runScheduledStatusCycle();
    });
  } catch (error: any) {
    try {
      if (error.code === 'EADDRINUSE') {
        console.trace(error);
        console.warn(`Port ${port} in use. Attempting to stop colliding processes/services...`);

        // Se tentou subir na 86 e deu colisão, derruba o processo registrado na 86 no STATUS
        if (port === 86) {
          const currentMap = readStatus();
          forceEvictPort86Owner(currentMap);
        }

        const out = spawnSync('powershell', ['Stop-Service', 'apps.ci.dev.br']);
        if (out.error) {
          console.trace('Failed to stop service:', out.error);
        } else {
          console.log('Service stopped successfully. Retrying...');
        }

        // Se for DEBUG, insiste na 86 após derrubar o ocupante; caso contrário busca próxima disponível
        const newPort = IS_DEBUG_INSTANCE ? 86 : getNextAvailablePort(86);
        await startApplication(app, newPort);
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
  const defaultPort = Number(process.env.PORT) || 86;

  const httpPort = getNextAvailablePort(defaultPort);

  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(server),
  );

  app.set('trust proxy', 'loopback');
  app.use(cookieParser());
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

  await startApplication(app, httpPort);
}

try {
  bootstrap().catch((err) => {
    console.trace('[Bootstrap Error]', err);
  });
} catch (error) {
  console.trace('[Fatal Error]', error);
}