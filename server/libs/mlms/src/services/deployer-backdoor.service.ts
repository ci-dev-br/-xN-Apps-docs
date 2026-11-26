import * as http from 'http';
import * as inspector from 'inspector';
import { cpSync, existsSync, readdirSync, readFileSync, statSync, unlinkSync } from 'fs';
import { join, resolve } from 'path';
import { execSync, spawn } from 'child_process';
import { ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  clearRegisteredStaticFileCaches,
  getRegisteredStaticFileCacheStats,
} from '@ci/core';
import {
  GetCommitsQueryDto,
  StartAppDto,
  GetCommitsResponseDto,
  ActionResponseDto,
  AppStatusResponseDto,
  AvailableVersionInfoDto,
  PublishActionInputDto,
  VersionNodeStatusDto,
} from './deployer-backdoor.dto';

@Injectable()
export class DeployerBackdoorServices {
  // Idealmente, busque essa URL de variáveis de ambiente (ex: ConfigService)
  private readonly backdoorUrl = 'http://localhost:4666';

  private publishStatus: 'idle' | 'running' | 'success' | 'error' = 'idle';
  private publishStartedAt: string | null = null;
  private publishFinishedAt: string | null = null;
  private publishLogs: string[] = [];

  private getRepoRoot(): string {
    if (existsSync(join(process.cwd(), 'gulp')) && existsSync(join(process.cwd(), 'apps'))) {
      return process.cwd();
    }
    return resolve(process.cwd(), '..');
  }

  private appendPublishLog(line: string) {
    const clean = line.trim();
    if (!clean) return;
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    for (const part of clean.split(/\r?\n/)) {
      if (part.trim()) {
        this.publishLogs.push(`[${timestamp}] ${part.trim()}`);
      }
    }
    if (this.publishLogs.length > 80) {
      this.publishLogs = this.publishLogs.slice(-80);
    }
  }

  private getFileMtimeIso(filePath: string): string | null {
    try {
      if (existsSync(filePath)) {
        return statSync(filePath).mtime.toISOString();
      }
    } catch {
      // ignora erro de leitura de stat
    }
    return null;
  }

  private isCurrentInstanceDebug(): boolean {
    return Boolean(
      inspector.url() !== undefined ||
      process.argv.some((arg) => arg === '--debug' || arg.startsWith('--debug=') || arg.startsWith('--inspect')) ||
      process.execArgv.some((arg) => arg.startsWith('--inspect') || arg.startsWith('--debug')) ||
      process.env.DEBUG === 'true' ||
      process.env.DEBUG === '1'
    );
  }

  /**
   * Método utilitário privado para encapsular o http nativo do Node.js em Promises
   */
  private makeRequest<T>(method: string, path: string, body?: any): Promise<T> {
    return new Promise((resolvePromise, rejectPromise) => {
      const url = new URL(`${this.backdoorUrl}${path}`);

      const options: http.RequestOptions = {
        method,
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        headers: {
          Accept: 'application/json',
        },
      };

      if (body) {
        options.headers['Content-Type'] = 'application/json';
      }

      const req = http.request(options, (res) => {
        let rawData = '';

        // Recebe os dados em pedaços (chunks)
        res.on('data', (chunk) => {
          rawData += chunk;
        });

        // Quando a resposta terminar de ser recebida
        res.on('end', () => {
          try {
            const parsedData = rawData ? JSON.parse(rawData) : null;

            // Verifica se o status HTTP indica sucesso (2xx)
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              resolvePromise(parsedData as T);
            } else {
              rejectPromise(new InternalServerErrorException(parsedData || 'Erro na requisição ao servidor backend'));
            }
          } catch {
            rejectPromise(new InternalServerErrorException('Falha ao processar a resposta do servidor'));
          }
        });
      });

      // Lida com erros de rede (ex: servidor offline)
      req.on('error', (err) => {
        rejectPromise(new InternalServerErrorException(`Erro de conexão com o script Node: ${err.message}`));
      });

      // Se houver um corpo na requisição (POST), escreve ele no stream
      if (body) {
        req.write(JSON.stringify(body));
      }

      // Finaliza o envio da requisição
      req.end();
    });
  }

  async getVersionInfo(): Promise<AvailableVersionInfoDto> {
    const repoRoot = this.getRepoRoot();
    const serverDir = join(repoRoot, 'server');
    const appsDir = join(repoRoot, 'apps');

    let version = '1.0.0';
    try {
      const serverPkgPath = join(serverDir, 'package.json');
      const rootPkgPath = join(repoRoot, 'package.json');
      if (existsSync(serverPkgPath)) {
        const pkg = JSON.parse(readFileSync(serverPkgPath, 'utf-8'));
        version = pkg.version || version;
      } else if (existsSync(rootPkgPath)) {
        const pkg = JSON.parse(readFileSync(rootPkgPath, 'utf-8'));
        version = pkg.version || version;
      }
    } catch {
      // fallback default
    }

    let branch = 'unknown';
    let commit = '';
    let author = '';
    let date = '';
    let message = '';
    let dirtyFilesCount = 0;

    // 1. Tenta ler info.json da raiz como base/fallback
    try {
      const infoPath = join(repoRoot, 'info.json');
      if (existsSync(infoPath)) {
        const info = JSON.parse(readFileSync(infoPath, 'utf-8'));
        branch = info.branch || branch;
        commit = info.commit || commit;
        author = info.author || author;
        date = info.date || date;
        message = info.message || message;
      }
    } catch {
      // ignora erro no info.json
    }

    // 2. Atualiza com dados em tempo real do Git caso disponível
    try {
      branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: repoRoot }).toString().trim() || branch;
      commit = execSync('git rev-parse HEAD', { cwd: repoRoot }).toString().trim() || commit;
      author = execSync('git log -1 --format=%an', { cwd: repoRoot }).toString().trim() || author;
      date = execSync('git log -1 --format=%ad', { cwd: repoRoot }).toString().trim() || date;
      message = execSync('git log -1 --format=%s', { cwd: repoRoot }).toString().trim() || message;
      const porcelain = execSync('git status --porcelain', { cwd: repoRoot }).toString().trim();
      dirtyFilesCount = porcelain ? porcelain.split(/\r?\n/).filter(Boolean).length : 0;
    } catch {
      // mantém dados do info.json
    }

    const shortCommit = commit ? commit.slice(0, 7) : 'N/A';

    const clientPublishedAt =
      this.getFileMtimeIso(join(serverDir, 'public', 'index.csr.html')) ||
      this.getFileMtimeIso(join(serverDir, 'public', 'index.html'));

    const clientDistAt =
      this.getFileMtimeIso(join(appsDir, 'dist', 'apps', 'browser', 'index.csr.html')) ||
      this.getFileMtimeIso(join(appsDir, 'dist', 'apps', 'browser', 'index.html'));

    const serverCompiledAt = this.getFileMtimeIso(join(serverDir, 'dist', 'main.js'));

    const nodes: VersionNodeStatusDto[] = [];
    try {
      const statusFile = join(serverDir, 'STATUS');
      if (existsSync(statusFile)) {
        const rawStatus = JSON.parse(readFileSync(statusFile, 'utf-8'));
        for (const [pidKey, info] of Object.entries<any>(rawStatus)) {
          nodes.push({
            pid: Number(pidKey),
            port: info?.port,
            status: info?.status || 'unknown',
            debug: Boolean(info?.debug),
            warmedUp: Boolean(info?.warmedUp),
            startedAt: info?.startedAt || '',
            lastHeartbeat: info?.lastHeartbeat,
          });
        }
      }
    } catch {
      // ignora falha de leitura momentânea do STATUS
    }

    const isDebug = this.isCurrentInstanceDebug();
    const currentEnvironment: 'debug' | 'production' = isDebug ? 'debug' : 'production';
    const hasDebugNode = nodes.some((n) => n.debug && (n.status === 'online' || n.status === 'running'));
    const hasProdNode = nodes.some((n) => !n.debug && (n.status === 'online' || n.status === 'running'));

    const orchestrationMode = hasDebugNode && hasProdNode
      ? 'Debug Ativo (assume porta 86 com troca automática sem afetar Produção)'
      : isDebug
        ? 'Modo Debug Ativo (troca automática habilitada)'
        : 'Produção Compilada Ativa (aguardando ou rotacionando na porta 86)';

    const cacheStats = getRegisteredStaticFileCacheStats();

    return {
      version,
      branch,
      commit,
      shortCommit,
      author,
      date,
      message,
      dirtyFilesCount,
      clientPublishedAt,
      clientDistAt,
      serverCompiledAt,
      currentPid: process.pid,
      currentEnvironment,
      orchestrationMode,
      nodes,
      publishStatus: this.publishStatus,
      publishStartedAt: this.publishStartedAt,
      publishFinishedAt: this.publishFinishedAt,
      publishLogs: this.publishLogs,
      staticCacheFilesCount: cacheStats.cachedFiles,
    };
  }

  assertDeveloperAndSysAdmin(roles?: string[] | Set<string>): void {
    const roleSet = roles instanceof Set ? roles : new Set(Array.isArray(roles) ? roles : []);
    if (!roleSet.has('DEVELOPER') || !roleSet.has('SYSADMIN')) {
      throw new ForbiddenException(
        'Acesso negado: esta ação requer simultaneamente os papéis DEVELOPER + SYSADMIN.',
      );
    }
  }

  private countFilesRecursive(dirPath: string): number {
    if (!existsSync(dirPath)) return 0;
    let total = 0;
    for (const entry of readdirSync(dirPath, { withFileTypes: true })) {
      const fullPath = join(dirPath, entry.name);
      if (entry.isDirectory()) {
        total += this.countFilesRecursive(fullPath);
      } else if (entry.isFile()) {
        total += 1;
      }
    }
    return total;
  }

  syncBrowserDistToServerPublic(): {
    copiedFiles: number;
    removedStaleFiles: number;
    clearedCacheEntries: number;
    sourceDir: string;
    targetDir: string;
  } {
    const repoRoot = this.getRepoRoot();
    const browserDistDir = join(repoRoot, 'apps', 'dist', 'apps', 'browser');
    const serverPublicDir = join(repoRoot, 'server', 'public');

    if (!existsSync(browserDistDir)) {
      throw new InternalServerErrorException(
        `Pasta de build de produção não encontrada em ${browserDistDir}.`,
      );
    }

    const copiedFiles = this.countFilesRecursive(browserDistDir);
    if (copiedFiles === 0) {
      throw new InternalServerErrorException(
        `Pasta ${browserDistDir} está vazia. Execute o build do cliente primeiro.`,
      );
    }

    let removedStaleFiles = 0;
    if (existsSync(serverPublicDir)) {
      const staleBundlePattern = /^(chunk|main|polyfills|scripts|styles)-[A-Za-z0-9_-]+\.(js|css|map)$/i;
      for (const entry of readdirSync(serverPublicDir)) {
        if (staleBundlePattern.test(entry)) {
          try {
            unlinkSync(join(serverPublicDir, entry));
            removedStaleFiles += 1;
          } catch (err: any) {
            this.appendPublishLog(`Aviso ao remover bundle antigo ${entry}: ${err?.message || err}`);
          }
        }
      }
    }

    cpSync(browserDistDir, serverPublicDir, { recursive: true, force: true });
    const cacheRes = clearRegisteredStaticFileCaches();

    this.appendPublishLog(
      `[Sync Public] ${copiedFiles} arquivo(s) atualizado(s) de apps/dist/apps/browser para server/public ` +
      `(${removedStaleFiles} bundle(s) antigo(s) removido(s), ${cacheRes.clearedEntries} entrada(s) de cache limpas).`,
    );

    return {
      copiedFiles,
      removedStaleFiles,
      clearedCacheEntries: cacheRes.clearedEntries,
      sourceDir: browserDistDir,
      targetDir: serverPublicDir,
    };
  }

  clearStaticCaches(): ActionResponseDto {
    const res = clearRegisteredStaticFileCaches();
    this.appendPublishLog(
      `[Cache AppController] ${res.clearedEntries} entrada(s) removida(s) de ${res.instances} instância(s).`,
    );
    return {
      status: 'success',
      mensagem: `Cache do AppController atualizado (${res.clearedEntries} arquivo(s) limpo(s)).`,
      saida: `Instâncias: ${res.instances}, Entradas removidas: ${res.clearedEntries}`,
    };
  }

  private scheduleGracefulExitAfterReplacement(replacementPid: number | undefined, serverDir: string): void {
    if (!replacementPid || this.isCurrentInstanceDebug()) {
      return;
    }

    const statusFile = join(serverDir, 'STATUS');
    const startedWaitAt = Date.now();
    const maxWaitMs = 20000;

    const checkReplacement = () => {
      try {
        if (existsSync(statusFile)) {
          const raw = readFileSync(statusFile, 'utf-8').trim();
          if (raw) {
            const parsed = JSON.parse(raw);
            const node = parsed?.[String(replacementPid)];
            if (node?.status === 'online') {
              const shutdownTimer = setTimeout(() => {
                try {
                  process.kill(process.pid, 'SIGTERM');
                } catch {
                  process.exit(0);
                }
              }, 800);
              shutdownTimer.unref();
              return;
            }
          }
        }
      } catch {
        // continua aguardando aquecimento do processo substituto
      }

      if (Date.now() - startedWaitAt >= maxWaitMs) {
        try {
          process.kill(process.pid, 'SIGTERM');
        } catch {
          process.exit(0);
        }
        return;
      }

      const nextTimer = setTimeout(checkReplacement, 400);
      nextTimer.unref();
    };

    const initialTimer = setTimeout(checkReplacement, 600);
    initialTimer.unref();
  }

  restartService(options?: { skipSpawn?: boolean; skipExit?: boolean }): ActionResponseDto {
    const cacheRes = clearRegisteredStaticFileCaches();
    const repoRoot = this.getRepoRoot();
    const serverDir = join(repoRoot, 'server');
    const mainJsPath = join(serverDir, 'dist', 'main.js');

    if (!existsSync(mainJsPath)) {
      return {
        status: 'success',
        mensagem: `Cache do AppController limpo (${cacheRes.clearedEntries} arquivo(s)). Build dist/main.js não encontrado para reinício completo.`,
        saida: `Cache limpo (${cacheRes.clearedEntries} arquivo(s)); dist/main.js ausente em ${serverDir}.`,
      };
    }

    if (options?.skipSpawn) {
      return {
        status: 'restarting',
        mensagem: `Cache do AppController limpo (${cacheRes.clearedEntries} arquivo(s)) e reinício simulado.`,
        saida: mainJsPath,
      };
    }

    const cleanEnv: NodeJS.ProcessEnv = { ...process.env };
    delete cleanEnv.DEBUG;
    if (cleanEnv.NODE_OPTIONS) {
      cleanEnv.NODE_OPTIONS = cleanEnv.NODE_OPTIONS
        .replace(/--inspect(?:-brk|-port)?(?:=\S+)?/g, '')
        .replace(/--debug(?:-brk|-port)?(?:=\S+)?/g, '')
        .trim();
    }

    const child = spawn('node', ['dist/main.js'], {
      cwd: serverDir,
      detached: true,
      stdio: 'ignore',
      env: cleanEnv,
      windowsHide: true,
    });
    child.unref();

    this.appendPublishLog(
      `[Restart] Cache limpo (${cacheRes.clearedEntries} entrada(s)) e nova instância iniciada (PID ${child.pid}).`,
    );

    if (!options?.skipExit) {
      this.scheduleGracefulExitAfterReplacement(child.pid, serverDir);
    }

    return {
      status: 'restarting',
      mensagem: this.isCurrentInstanceDebug()
        ? `Cache do AppController limpo (${cacheRes.clearedEntries} entrada(s)) e instância de produção iniciada (PID ${child.pid}); sessão DEBUG preservada.`
        : `Cache do AppController limpo (${cacheRes.clearedEntries} entrada(s)) e serviço reiniciado com nova instância (PID ${child.pid}).`,
      saida: `Novo PID: ${child.pid} | Cache limpo: ${cacheRes.clearedEntries}`,
    };
  }

  private runCommandAsync(command: string, args: string[], cwd: string, label: string): Promise<void> {
    return new Promise((resolvePromise, rejectPromise) => {
      this.appendPublishLog(`Iniciando [${label}]: ${command} ${args.join(' ')} (em ${cwd})`);

      const child = spawn(command, args, {
        cwd,
        shell: true,
        env: { ...process.env },
      });

      child.stdout?.on('data', (chunk) => {
        this.appendPublishLog(chunk.toString());
      });

      child.stderr?.on('data', (chunk) => {
        this.appendPublishLog(chunk.toString());
      });

      child.on('error', (err) => {
        this.appendPublishLog(`Erro em [${label}]: ${err.message}`);
        rejectPromise(err);
      });

      child.on('close', (code) => {
        if (code === 0) {
          this.appendPublishLog(`Concluído [${label}] com sucesso (código 0).`);
          resolvePromise();
        } else {
          const err = new Error(`Processo [${label}] finalizou com código ${code}`);
          this.appendPublishLog(err.message);
          rejectPromise(err);
        }
      });
    });
  }

  async publishVersion(dto?: PublishActionInputDto, roles?: string[] | Set<string>): Promise<ActionResponseDto> {
    if (roles !== undefined) {
      this.assertDeveloperAndSysAdmin(roles);
    }

    const action = dto?.action || 'gulp';

    if (action === 'reload-cache') {
      const res = this.clearStaticCaches();
      this.publishStatus = 'success';
      this.publishFinishedAt = new Date().toISOString();
      return res;
    }

    if (action === 'restart') {
      const res = this.restartService();
      this.publishStatus = 'success';
      this.publishFinishedAt = new Date().toISOString();
      return res;
    }

    if (action === 'sync-public') {
      this.publishStartedAt = new Date().toISOString();
      const syncRes = this.syncBrowserDistToServerPublic();
      this.publishStatus = 'success';
      this.publishFinishedAt = new Date().toISOString();
      return {
        status: 'success',
        mensagem: `Pasta server/public atualizada a partir de apps/dist/apps/browser (${syncRes.copiedFiles} arquivo(s)) e cache do AppController limpo.`,
        saida: `Copiados: ${syncRes.copiedFiles} | Antigos removidos: ${syncRes.removedStaleFiles} | Cache limpo: ${syncRes.clearedCacheEntries}`,
      };
    }

    if (this.publishStatus === 'running') {
      return {
        status: 'running',
        mensagem: 'Já existe uma publicação em andamento. Acompanhe o progresso nas informações de versão.',
        detalhes: this.publishLogs.slice(-10).join('\n'),
      };
    }

    const repoRoot = this.getRepoRoot();
    const gulpDir = join(repoRoot, 'gulp');
    const appsDir = join(repoRoot, 'apps');
    const serverDir = join(repoRoot, 'server');
    const gulpBinLocal = join(gulpDir, 'node_modules', 'gulp', 'bin', 'gulp.js');
    const ngBinLocal = join(appsDir, 'node_modules', '@angular', 'cli', 'bin', 'ng.js');

    this.publishStatus = 'running';
    this.publishStartedAt = new Date().toISOString();
    this.publishFinishedAt = null;
    this.publishLogs = [];

    const executePipeline = async () => {
      try {
        if (action === 'gulp' || action === 'full-publish') {
          if (existsSync(gulpBinLocal)) {
            await this.runCommandAsync('node', [`"${gulpBinLocal}"`], gulpDir, 'Gulp Client Prod');
          } else if (existsSync(ngBinLocal)) {
            await this.runCommandAsync(
              'node',
              [`"${ngBinLocal}"`, 'build', '--configuration', 'production'],
              appsDir,
              'Angular Client Prod',
            );
          } else {
            await this.runCommandAsync('gulp', [], gulpDir, 'Gulp Client Prod');
          }
          this.syncBrowserDistToServerPublic();
        }

        if (action === 'server-build' || action === 'full-publish') {
          await this.runCommandAsync('npm', ['run', 'build'], serverDir, 'Backend Build Prod');
          this.restartService();
        }

        if (action === 'sync-git') {
          await this.runCommandAsync('npm', ['run', 'sync'], repoRoot, 'Git Sync');
        }

        this.publishStatus = 'success';
        this.publishFinishedAt = new Date().toISOString();
      } catch (err: any) {
        this.publishStatus = 'error';
        this.publishFinishedAt = new Date().toISOString();
        this.appendPublishLog(`Falha na publicação (${action}): ${err?.message || err}`);
      }
    };

    // Dispara em background para não bloquear a requisição HTTP durante o build de produção
    executePipeline();

    const descriptions: Record<string, string> = {
      'gulp': 'Build de produção do cliente iniciado (apps/dist/apps/browser -> server/public + atualização de cache).',
      'server-build': 'Compilação de produção do backend (/server) e reinício do serviço iniciados.',
      'full-publish': 'Publicação completa iniciada (Cliente -> server/public + Backend + Cache + Reinício do serviço).',
      'sync-git': 'Sincronização de repositório Git iniciada.',
    };

    return {
      status: 'running',
      mensagem: descriptions[action] || 'Publicação iniciada com sucesso.',
      saida: `Ação '${action}' em execução desde ${this.publishStartedAt}`,
    };
  }

  async getCommits(query: GetCommitsQueryDto): Promise<GetCommitsResponseDto> {
    // Converte o objeto de DTO em query string (ex: limit=10&skip=0)
    // Usamos Record<string, string> para garantir que URLSearchParams aceite os valores
    const cleanQuery = Object.entries(query || {})
      .filter(([_, value]) => value !== undefined)
      .reduce((acc, [key, value]) => ({ ...acc, [key]: String(value) }), {});

    const qs = new URLSearchParams(cleanQuery).toString();
    const path = qs ? `/commits?${qs}` : '/commits';

    return this.makeRequest<GetCommitsResponseDto>('GET', path);
  }

  async executeCommit(): Promise<ActionResponseDto> {
    return this.makeRequest<ActionResponseDto>('POST', '/commit');
  }

  async startApp(dto: StartAppDto): Promise<ActionResponseDto> {
    return this.makeRequest<ActionResponseDto>('POST', '/app/start', dto);
  }

  async stopApp(): Promise<ActionResponseDto> {
    return this.makeRequest<ActionResponseDto>('POST', '/app/stop');
  }

  async getAppStatus(): Promise<AppStatusResponseDto> {
    return this.makeRequest<AppStatusResponseDto>('GET', '/app/status');
  }
}