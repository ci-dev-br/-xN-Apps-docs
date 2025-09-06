import { IncomingMessage } from 'http';
import { get as https_get, } from 'https';
import { get as http_get } from 'http';
import { CloudflareIntegration } from '../integration/cloudflare.integration';
import { ChildProcessWithoutNullStreams, Serializable, spawn } from 'node:child_process';
// const url = process.env.PUBLIC_GATEWAY_API;
// const { cwd, env } = require('process');
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
        200: ((...arg) => console.log('[ok]')),
    }
    constructor() {
        console.log('[ci.dev.br] Iniciando serviços...');
        if (process.env.VERIFY_ACCEESS_ON_INITIAL) {
            const rotas_verificacao
                = JSON.parse(process.env.VERIFY_ACCEESS_ON_INITIAL);
            if (Array.isArray(rotas_verificacao))
                rotas_verificacao.forEach(rota => {
                    try {
                        this.adicionarVerificacaoRota(rota);
                    } catch (error) {
                        console.error('Falha')
                    }
                })
        }
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
            console.error('Falha')
        }

        setTimeout(() => this.adicionarVerificacaoRota(url, replayTimeout), replayTimeout);
    }
    private async incomingMessageHandler(res: IncomingMessage) {
        try {
            if (res.statusCode && this.errorCodeListners[res.statusCode])
                (this.errorCodeListners[res.statusCode])(res);
        } catch (error) {
            console.error('falha ao receber a mensagem')
        }
    }
    private async errorHandler(error: Error) {
        console.error('Falha ao conectar', error);
    }
    // @RequestStatusHandler(530) /// TODO: Implementar decorator para assinar retorno de códido de erro
    private async cloudFlareTunnelInactiveHandler() {
        const cloudflare_integration = new CloudflareIntegration({
            token: process.env.CF_TOKEN
        });
    }
    private _tasks: RunnerTask[] = [];
    protected addTask(task: RunnerTask) {
        this._tasks.push(task);
        try {
            this.runTask(task);
        } catch (error) {
            console.error('Falha ao executar tarefa', error);
        }
    }
    private taskErrorHandler(error: Error, task: RunnerTask) {
        console.error('Falha ao executar tarefa', error);
    }
    private taskDataHandler(message: any, task: RunnerTask) {
        console.log('[task]', message.toString());
        this.listeners['message'].forEach(cb => {
            try {
                cb(message.toString());
            } catch (error) {
                console.trace(error);
            }
        })
    }
    private taskCloseHandler(code: number | null, task: RunnerTask) {
        console.log('Closed', code);
    }
    private runTask(task: RunnerTask) {
        task.process = spawn(task.command, {
            cwd: task.cwd,
            env: process.env,
            shell: true
        });
        task.process?.on('error', error => this.taskErrorHandler(error, task))
        task.process?.stdout.on('data', message => this.taskDataHandler(message, task))
        task.process?.on('close', code => this.taskCloseHandler(code, task))
    }
    private listeners: { [name: string]: ((event: any) => void)[] } = {};
    addEventLitener(eventName: string, callBack: ((event: any) => void)) {
        this.listeners[eventName] = [
            ...(this.listeners[eventName] || []),
            callBack
        ];
    }
} 