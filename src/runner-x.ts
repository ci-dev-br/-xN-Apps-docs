import { IncomingMessage } from 'http';
import { get as https_get, } from 'https';
import { get as http_get } from 'http';
import { CloudflareIntegration } from './integration/cloudflare.integration';
const url = process.env.PUBLIC_GATEWAY_API;

/***
 * RunnerX, orquestra as execuções dos processos iniciais e resolve rotas e 
 * acesso para as aplicações interna e externo a rede para os projetos 
 * configurados nas variáveis de ambeinte.
 * 
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
                    this.adicionarVerificacaoRota(rota);
                })
        }
    }
    protected async adicionarVerificacaoRota(url: string, replayTimeout = (60000)) {
        console.log(`[ verificando rota ]`);

        if (url.indexOf('https://') === 0)
            https_get(url,
                (...arg) => this.getHandler(...arg));
        else if (url.indexOf('http://') === 0)
            http_get(url,
                (...arg) => this.getHandler(...arg));

        setTimeout(() => this.adicionarVerificacaoRota(url, replayTimeout), replayTimeout);
    }
    private async getHandler(res: IncomingMessage) {
        if (res.statusCode && this.errorCodeListners[res.statusCode])
            (this.errorCodeListners[res.statusCode])(res);
    }
    // @RequestStatusHandler(530) /// TODO: Implementar decorator para assinar retorno de códido de erro
    private async cloudFlareTunnelInactiveHandler() {
        const cloudflare_integration = new CloudflareIntegration({
            token: process.env.CF_TOKEN
        });
    }
} 