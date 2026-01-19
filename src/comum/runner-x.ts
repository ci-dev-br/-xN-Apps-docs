import { IncomingMessage } from 'http';
import { get as https_get, } from 'https';
import { get as http_get } from 'http';
import { CloudflareIntegration } from '../integration/cloudflare.integration';
import { ChildProcessWithoutNullStreams, Serializable, spawn } from 'node:child_process';
export interface RunnerTask {
    name: string;
    type: string;
    command: string;
    cwd: string;
    process?: ChildProcessWithoutNullStreams;
}
/***
 * RunnerX, orquestra as execuções dos processos iniciais e resolve rotas e 
 * acesso para as aplicações interna e externo a rede para os projetos 
 * configurados nas variáveis de ambeinte.
 */
export abstract class RunnerX {
    errorCodeListners = {
        530: ((...arg) => this.cloudFlareTunnelInactiveHandler()),
        200: ((...arg) => console.log('[Online]')),
        default: ((...arg) => console.trace('[O que fazer?]', arg)),
    }
    constructor() {
        console.log('[ci.dev.br] Iniciando serviços...');
    }
    protected async adicionarVerificacaoRota(url: string, replayTimeout = (60000)) {
        console.log(`[ verificando rota ]`);
        try {
            if (url.indexOf('https://') === 0)
                https_get(url,
                    (...arg) => this.incomingMessageHandler(...arg))
                    .on('error', e => this.errorHandler(e));
            else if (url.indexOf('http://') === 0)
                http_get(url,
                    (...arg) => this.incomingMessageHandler(...arg))
                    .on('error', e => this.errorHandler(e));

        } catch (error) {
            console.error('[Falha na verificação de Rotas de Acesso]', error);
            console.trace(error);
        }
        setTimeout(() => this.adicionarVerificacaoRota(url, replayTimeout), replayTimeout);
    }
    private async incomingMessageHandler(res: IncomingMessage) {
        try {
            if (res.statusCode && this.errorCodeListners[res.statusCode])
                (this.errorCodeListners[res.statusCode])(res);
            else
                (this.errorCodeListners.default)(res);
        } catch (error) {
            console.error('[falha ao receber a mensagem]', error);
            console.trace(error);
        }
    }
    private async errorHandler(error: Error) {
        console.error('Falha ao conectar', error);
        console.trace(error);
    }
    // @RequestStatusHandler(530) /// TODO: Implementar decorator para assinar retorno de códido de erro
    private async cloudFlareTunnelInactiveHandler() {
        console.log('[Configurando Tunel com CloudFlare]')
        console.log(`status-token: ${!!process.env.CF_TOKEN}`)
        const cloudflare_integration = new CloudflareIntegration({
            token: process.env.CF_TOKEN
        });
    }
    private _tasks: RunnerTask[] = [];
    protected addTask(task: RunnerTask) {
        this._tasks.push(task);
        try {
            this.runTask(task);
            // this._tasks = [];
        } catch (error) {
            console.error('[Falha ao Iniciar ao Adicinar tarefa]', error);
            console.trace('[Falha ao Iniciar ao Adicinar tarefa]', error);
        }
    }
    private taskErrorHandler(error: Error, task: RunnerTask) {
        console.error('[Falha ao executar tarefa]', error);
        console.trace('Falha ao executar tarefa', error);
    }
    private defaultHandler(error: any, eventName: string, task: RunnerTask) {
        console.log(`[Retorno ${eventName}]`, error);
        console.trace(error);
    }
    private taskDataHandler(message: any, task: RunnerTask) {
        console.log('[task]', (message.toString() || message));
        this.listeners['message'].forEach(cb => {
            try {
                cb(message.toString());
            } catch (error) {
                console.trace(error);
            }
        })
    }
    private taskCloseHandler(code: number | null, task: RunnerTask) {
        console.log('[closed]', code);
        setTimeout(() => {
            this.runTask(task);
        }, 3000);
    }
    private runTask(task: RunnerTask) {
        try {
            console.info(`[run task] ${task.name}`);
            task.process = spawn(task.command, {
                cwd: task.cwd,
                env: process.env,
                shell: true
            });
            task.process?.on('disconnect', error => this.defaultHandler(error, 'disconnect', task))
            task.process?.on('spawn', error => this.defaultHandler(error, 'spawn', task))
            task.process?.on('error', error => this.taskErrorHandler(error, task))
            task.process?.stdout.on('data', message => this.taskDataHandler(message, task))
            task.process?.on('close', code => this.taskCloseHandler(code, task))
            if (task.process) {
                task.process.stderr.on('data', (chunk) => {
                    this.defaultHandler(chunk, 'chunk', task);
                })
                task.process.stderr.on('error', (chunk) => {
                    this.defaultHandler(chunk, 'error', task);
                })
                task.process.stderr.on('readable', (chunk) => {
                    this.defaultHandler(chunk, 'readable', task);
                })
                task.process.stderr.on('resume', (chunk) => {
                    this.defaultHandler(chunk, 'resume', task);
                })
            }
        } catch (error) {
            console.error('[Falha ao iniciar Tarefa]', error);
            console.trace(error);
        }
    }
    private listeners: { [name: string]: ((event: any) => void)[] } = {};
    addEventLitener(eventName: string, callBack: ((event: any) => void)) {
        try {
            this.listeners[eventName] = [
                ...(this.listeners[eventName] || []),
                callBack
            ];
        } catch (error) {
            console.error('Error on add event listener', error)
        }
    }
} 