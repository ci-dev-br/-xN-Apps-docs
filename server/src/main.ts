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

// Caminho atualizado para __dirname + '/../STATUS'
const STATUS_FILE = join(__dirname, '..', 'STATUS');
const TEN_MINUTES_MS = 10 * 60 * 1000;
const HEARTBEAT_INTERVAL_MS = 1 * 1000; // 10 segundos (1 ciclo)
const ZOMBIE_TIMEOUT_MS = 3 * 1000;     // 20 segundos (2 ciclos sem sinal de vida)

interface ProcessInfo {
  startedAt: string;
  updatedAt?: string;
  lastHeartbeat?: string;
  stoppedAt?: string;
  status: 'running' | 'online' | 'fail' | 'stopped';
  port?: number;
  previousPort?: number;
}

type StatusMap = Record<string, ProcessInfo>;

let memoryStatusCache: StatusMap = {};
let heartbeatTimer: NodeJS.Timeout | null = null;
let globalApp: NestExpressApplication | null = null;
let isMigratingTo86 = false;

/**
 * Lê o arquivo STATUS garantindo que nenhum outro PID registrado anteriormente seja perdido.
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
        memoryStatusCache = { ...memoryStatusCache, ...parsed };
        return memoryStatusCache;
      }
    } catch {
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 50);
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
    writeFileSync(STATUS_FILE, JSON.stringify(statusMap, null, 2), { encoding: 'utf-8' });
  }

  return statusMap;
}

/**
 * Valida se um processo está vivo (status ativo + sinal de vida dentro de 2 ciclos / 20s).
 */
function isProcessTrulyAlive(info: ProcessInfo, now = Date.now()): boolean {
  if (info.status !== 'online' && info.status !== 'running') {
    return false;
  }

  const lastBeatStr = info.lastHeartbeat || info.updatedAt || info.startedAt;
  const lastBeatTime = lastBeatStr ? new Date(lastBeatStr).getTime() : 0;

  return (now - lastBeatTime) <= ZOMBIE_TIMEOUT_MS;
}

/**
 * Varre o StatusMap procurando processos que estão há mais de 2 ciclos (20s)
 * sem dar sinal de vida e os atualiza para 'stopped'.
 */
function cleanUpZombies(statusMap: StatusMap, now = Date.now()): void {
  const currentPid = String(process.pid);

  for (const [pid, info] of Object.entries(statusMap)) {
    if (pid === currentPid) continue;

    if ((info.status === 'online' || info.status === 'running') && !isProcessTrulyAlive(info, now)) {
      const lastSeen = info.lastHeartbeat || info.updatedAt || info.startedAt || new Date(now).toISOString();
      statusMap[pid] = {
        ...info,
        status: 'stopped',
        stoppedAt: lastSeen,
        updatedAt: new Date(now).toISOString(),
      };
      console.warn(`[STATUS] Processo Zombie detectado (PID ${pid} na porta ${info.port}). Marcado como 'stopped'.`);
    }
  }
}

/**
 * Salva ou atualiza o status do PID atual e já aproveita para limpar zombies.
 */
function savePidStatus(data: Partial<ProcessInfo>, startNewProcess = false): StatusMap {
  const statusMap = readStatus();
  const pid = String(process.pid);
  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();

  // Limpa eventuais processos zombies antes de salvar
  cleanUpZombies(statusMap, nowMs);

  if (startNewProcess || !statusMap[pid]) {
    statusMap[pid] = {
      startedAt: nowIso,
      status: 'running',
      ...data,
      lastHeartbeat: nowIso,
      updatedAt: nowIso,
    };
  } else {
    statusMap[pid] = {
      ...statusMap[pid],
      ...data,
      lastHeartbeat: nowIso,
      updatedAt: nowIso,
    };
  }

  return writeStatusMap(statusMap);
}

/**
 * Verifica se existe alguma aplicação viva utilizando ou migrando para a porta 86.
 */
function isPort86Occupied(statusMap: StatusMap, now = Date.now()): boolean {
  return Object.values(statusMap).some(
    (info) => info.port === 86 && isProcessTrulyAlive(info, now)
  );
}

/**
 * Orquestração de Eleição: Determina se ESTA instância deve assumir a porta 86.
 * Usa o arquivo STATUS como fonte de verdade para ordenar todas as instâncias vivas
 * por antiguidade (startedAt) e PID, garantindo que apenas UMA assuma a porta 86.
 */
function shouldThisInstanceClaimPort86(statusMap: StatusMap, now = Date.now()): boolean {
  const currentPid = String(process.pid);
  const myInfo = statusMap[currentPid];

  // Só candidatos que já estão 'online' em outra porta podem migrar para a 86
  if (!myInfo || myInfo.status !== 'online' || myInfo.port === 86) {
    return false;
  }

  // Se já existe alguém vivo na porta 86 (online ou running/migrando), ninguém assume
  if (isPort86Occupied(statusMap, now)) {
    return false;
  }

  // Lista todos os processos candidatos vivos e 'online'
  const aliveCandidates = Object.entries(statusMap)
    .filter(([, info]) => info.status === 'online' && isProcessTrulyAlive(info, now))
    .sort(([pidA, infoA], [pidB, infoB]) => {
      const timeA = new Date(infoA.startedAt).getTime();
      const timeB = new Date(infoB.startedAt).getTime();
      if (timeA !== timeB) {
        return timeA - timeB; // Prioriza a instância que iniciou primeiro (mais antiga)
      }
      return Number(pidA) - Number(pidB); // Desempate determinístico pelo menor PID
    });

  if (aliveCandidates.length === 0) {
    return false;
  }

  // Apenas o líder eleito (posição 0) tem permissão para reivindicar a porta 86
  const [electedPid] = aliveCandidates[0];
  return electedPid === currentPid;
}

/**
 * Realiza a migração da instância atual para a porta 86 sem derrubar o processo.
 */
async function migrateToPort86() {
  if (!globalApp || isMigratingTo86) return;
  isMigratingTo86 = true;

  const currentPid = String(process.pid);
  const statusMap = readStatus();
  const previousPort = statusMap[currentPid]?.port;

  try {
    // 1. Reserva imediatamente a porta 86 no STATUS (status: 'running', port: 86)
    // Isso trava a porta 86 no arquivo STATUS para que outras instâncias vejam que já foi assumida.
    savePidStatus({
      status: 'running',
      port: 86,
      previousPort,
    });

    // 2. Relê o STATUS para confirmar que não houve colisão de escrita no mesmo milissegundo
    const verifyMap = readStatus();
    const conflictingPids = Object.entries(verifyMap).filter(
      ([pid, info]) => pid !== currentPid && info.port === 86 && isProcessTrulyAlive(info)
    );

    if (conflictingPids.length > 0) {
      // Se outro processo com maior prioridade também escreveu no mesmo instante, cede a vez
      const allOn86 = [
        [currentPid, verifyMap[currentPid]] as const,
        ...conflictingPids,
      ].sort(([pidA, infoA], [pidB, infoB]) => {
        const tA = new Date(infoA.startedAt).getTime();
        const tB = new Date(infoB.startedAt).getTime();
        return tA !== tB ? tA - tB : Number(pidA) - Number(pidB);
      });

      if (allOn86[0][0] !== currentPid) {
        console.log(`[Orquestração] Outra instância (${allOn86[0][0]}) teve prioridade na porta 86. Mantendo porta ${previousPort}.`);
        savePidStatus({ status: 'online', port: previousPort });
        isMigratingTo86 = false;
        return;
      }
    }

    console.log(`[Orquestração] Porta 86 livre. Migrando instância (PID ${currentPid}) da porta ${previousPort} para a porta 86...`);

    // 3. Fecha o listener da porta atual e reabre na porta 86
    const httpServer = globalApp.getHttpServer();
    if (httpServer && httpServer.listening) {
      await new Promise<void>((resolve) => httpServer.close(() => resolve()));
    }

    await globalApp.listen(86);

    savePidStatus({
      status: 'online',
      port: 86,
    });

    console.log(`[Orquestração] Aplicação (PID ${currentPid}) assumiu a porta 86 com sucesso!`);
  } catch (err: any) {
    console.error(`[Orquestração] Falha ao migrar para a porta 86 (${err?.message}). Retornando para porta ${previousPort}...`);
    try {
      if (previousPort && previousPort !== 86) {
        await globalApp.listen(previousPort);
        savePidStatus({ status: 'online', port: previousPort });
      }
    } catch (fallbackErr) {
      console.error('[Orquestração] Erro crítico ao retornar para porta anterior:', fallbackErr);
      savePidStatus({ status: 'fail', stoppedAt: new Date().toISOString() });
      process.exit(1);
    }
  } finally {
    isMigratingTo86 = false;
  }
}

/**
 * Inicia a "prova de vida" (heartbeat) a cada 10 segundos:
 * 1. Atualiza o lastHeartbeat do processo atual.
 * 2. Marca como 'stopped' os processos zombies (> 20s sem sinal).
 * 3. Orquestra a tomada da porta 86 caso ela esteja livre.
 */
function startHeartbeat() {
  if (heartbeatTimer) clearInterval(heartbeatTimer);

  heartbeatTimer = setInterval(async () => {
    if (isMigratingTo86) return;

    // Atualiza prova de vida e limpa zombies (> 20s)
    const updatedMap = savePidStatus({});

    // Verifica se a porta 86 está órfã e se esta instância foi eleita pelo STATUS para assumi-la
    if (shouldThisInstanceClaimPort86(updatedMap)) {
      await migrateToPort86();
    }
  }, HEARTBEAT_INTERVAL_MS);

  heartbeatTimer.unref();
}

/**
 * Verifica disponibilidade de uma porta na inicialização:
 * - Porta 86: Livre imediatamente se ninguém estiver vivo ('online'/'running' nos últimos 20s) nela.
 * - Demais portas: Livres apenas após 10 minutos de abandono.
 */
function isPortAvailable(port: number, statusMap: StatusMap): boolean {
  const currentPid = String(process.pid);
  const now = Date.now();

  cleanUpZombies(statusMap, now);

  const entriesOnPort = Object.entries(statusMap)
    .filter(([pid, info]) => pid !== currentPid && info.port === port)
    .map(([, info]) => info);

  if (entriesOnPort.length === 0) {
    return true;
  }

  // Regra exclusiva da Porta 86
  if (port === 86) {
    const isSomeoneAliveOn86 = entriesOnPort.some((info) => isProcessTrulyAlive(info, now));
    return !isSomeoneAliveOn86;
  }

  // Regra para as demais portas: 10 minutos de abandono
  for (const info of entriesOnPort) {
    if (isProcessTrulyAlive(info, now)) {
      return false;
    }

    const lastTimeStr = info.stoppedAt || info.lastHeartbeat || info.updatedAt || info.startedAt;
    const abandonedTime = lastTimeStr ? new Date(lastTimeStr).getTime() : 0;

    if (now - abandonedTime < TEN_MINUTES_MS) {
      return false;
    }
  }

  return true;
}

/**
 * Retorna a porta preferencial (ex: 86) se disponível, ou sorteia uma porta livre respeitando os 10 minutos.
 */
function getNextAvailablePort(preferredPort: number): number {
  const statusMap = readStatus();

  if (isPortAvailable(preferredPort, statusMap)) {
    return preferredPort;
  }

  let candidatePort: number;
  do {
    candidatePort = Math.floor(Math.random() * (65535 - 1024 + 1)) + 1024;
  } while (!isPortAvailable(candidatePort, statusMap));

  return candidatePort;
}

// 1. Nasce o processo: registra no STATUS, limpa eventuais zombies e inicia o ciclo de prova de vida
let STATUS = savePidStatus({ status: 'running' }, true);
startHeartbeat();

/**
 * 2. Monitora o encerramento da aplicação para parar o heartbeat e atualizar o status
 */
let isShuttingDown = false;
function handleExit() {
  if (isShuttingDown) return;
  isShuttingDown = true;

  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
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

process.on('exit', () => handleExit());
process.on('SIGINT', () => { handleExit(); process.exit(0); });
process.on('SIGTERM', () => { handleExit(); process.exit(0); });
process.on('SIGHUP', () => { handleExit(); process.exit(0); });
process.on('SIGBREAK', () => { handleExit(); process.exit(0); });

/***
 * Inicializa variáveis de ambiente
 ***/
config();
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

    // Registra a intenção de porta antes do listen para evitar que outra instância pegue a mesma porta durante o boot
    savePidStatus({ status: 'running', port });

    await app.listen(port, () => {
      STATUS = savePidStatus({
        status: 'online',
        port,
      });
      console.log(`Non-Secure HTTP Application is Running on port ${port}`);
    });
  } catch (error: any) {
    try {
      if (error.code === 'EADDRINUSE') {
        console.trace(error);
        console.warn('Port in use. Attempting to stop colliding services...');

        const out = spawnSync('powershell', ['Stop-Service', 'apps.ci.dev.br']);
        if (out.error) {
          console.trace('Failed to stop service:', out.error);
        } else {
          console.log('Service stopped successfully. Retrying...');
        }

        const newPort = getNextAvailablePort(86);
        await startApplication(app, newPort);
      } else {
        console.trace('[Falha ao iniciar serviços]');
        console.trace(error);
        STATUS = savePidStatus({
          status: 'fail',
          stoppedAt: new Date().toISOString(),
        });
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