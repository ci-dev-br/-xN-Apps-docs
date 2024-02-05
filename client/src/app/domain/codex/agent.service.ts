import { HttpClient } from "@angular/common/http";
import { Injectable, Injector, Optional } from "@angular/core";
import { WindowService } from "src/app/components/window/window.service";

@Injectable()
export class AgentService {
    constructor(
        private readonly http: HttpClient,
        private readonly injetor?: Injector,
        @Optional()
        private readonly janela?: WindowService,
    ) { }
    private santizeScript(text: string) {
        return text
            .replace(/(this)/g, '_internal_this')
            .replace(/(undefined)/g, '__undefined__')
            .replace(/(true)/g, '__true__')
            .replace(/(false)/g, '__false__')
            .replace(/(process|alert|document|window|console|fetch|eval)/g, '__undefined__')
    }
    async exec(code: string) {
        try {
             await (async() => {
                const __undefined__ = undefined;
                const __null__ = null;
                const __true__ = true;
                const __false__ = false;
                const http = this.http;
                const _internal_this = {
                    injetor: this.injetor,
                    janela: this.janela,
                };

                const any_code = `(new Promise(async (res,rej) => {
                        try{
                            const ___internal = (async () => {
                                ${this.santizeScript(code)}
                            });
                            res(await ___internal());
                        }catch(err){
                            rej(err);
                        }
                    })).then(r => {
                        alert('Executado com sucesso!, resultado ='+ String(r));
                    }).catch(err => {
                        alert('Falha ao executar código no agente.');
                    });`;

                await eval(any_code);
            })();
        } catch (error) {
            try {
                console.error(error);
            } catch (error) {
                console.error(error);
            }
        }  
    }
}