import * as http from 'http';
import * as inspector from 'inspector';
import { existsSync, readFileSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { execSync, spawn } from 'child_process';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
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

  async publishVersion(dto?: PublishActionInputDto): Promise<ActionResponseDto> {
    const action = dto?.action || 'gulp';

    if (this.publishStatus === 'running') {
      return {
        status: 'running',
        mensagem: 'Já existe uma publicação em andamento. Acompanhe o progresso nas informações de versão.',
        detalhes: this.publishLogs.slice(-10).join('\n'),
      };
    }

    const repoRoot = this.getRepoRoot();
    const gulpDir = join(repoRoot, 'gulp');
    const serverDir = join(repoRoot, 'server');
    const gulpBinLocal = join(gulpDir, 'node_modules', 'gulp', 'bin', 'gulp.js');

    this.publishStatus = 'running';
    this.publishStartedAt = new Date().toISOString();
    this.publishFinishedAt = null;
    this.publishLogs = [];

    const executePipeline = async () => {
      try {
        if (action === 'gulp' || action === 'full-publish') {
          if (existsSync(gulpBinLocal)) {
            await this.runCommandAsync('node', [gulpBinLocal], gulpDir, 'Gulp Client Prod');
          } else {
            await this.runCommandAsync('gulp', [], gulpDir, 'Gulp Client Prod');
          }
        }

        if (action === 'server-build' || action === 'full-publish') {
          await this.runCommandAsync('npm', ['run', 'build'], serverDir, 'Backend Build Prod');
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
      'gulp': 'Geração de nova versão em produção do cliente iniciada via Gulp (/gulp).',
      'server-build': 'Compilação da versão de produção do backend (/server) iniciada.',
      'full-publish': 'Publicação completa iniciada (Cliente via Gulp + Compilação do Backend).',
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