import { HttpErrorResponse, HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Inject, Injectable, Injector, Optional } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError, switchMap, timeout, finalize, shareReplay } from "rxjs/operators";
import { StorageService } from "../storage/storage.service";
import { AuthService } from "@ci/portal-api";
import { CORE_ENV, ICoreEnvironment } from "../provider";
import { Router } from "@angular/router";
import { Message } from "../services/message";
import { ConsoleService } from "../services/console.service";

// import { AuthService } from "@ci/portal-api";
/**
 *  Interceptador de requisições HTTP para adicionar o token de autorização e tratar erros.
 * 
 * ## Descrição:
 * Este interceptador é responsável por interceptar todas as requisições HTTP feitas pela aplicação. Ele executa as seguintes tarefas:

1. **Adição de Token de Autorização:** Antes de cada requisição, verifica se existe um token de autorização (bearer token) armazenado localmente. Se sim, adiciona este token ao cabeçalho `Authorization` da requisição. Isso garante que as requisições autenticadas sejam enviadas com as credenciais necessárias.

2. **Tratamento de Erros de Rede e API:**
   - **Timeout:** Aplica um timeout para cada requisição. Se a requisição não for concluída dentro desse tempo, um `HttpErrorResponse` com status 0 (Interceptor Timeout) é gerado.
   - **Erros de Conexão (status 0 ou 404):** Se a requisição falhar com status 0 (geralmente indicando problemas de rede ou timeout) ou 404 (recurso não encontrado), o interceptador tenta alternar para um gateway de API alternativo, se configurado. Ele mantém uma lista de `alternativeApiGateways` e tenta a próxima URL na lista. Isso visa melhorar a resiliência da aplicação em caso de falhas de um servidor de API. Um contador `_pipocate` é usado para evitar loops infinitos de tentativas.
   - **Acesso Negado (mensagem específica):** Se a mensagem de erro indicar "Acesso negado. Não corresponde ao nível de acesso necessário.", o usuário é redirecionado para a página `/meus-apps`.
   - **Erro de Autorização (status 401):** Se a requisição retornar um status 401 (Não Autorizado) e houver um `refreshToken` disponível, o interceptador tenta renovar o token de acesso usando o `AuthService`. Se a renovação for bem-sucedida, o novo token é armazenado, e a requisição original é repetida com o novo token. Se a renovação falhar, o erro é propagado.

3. **Gerenciamento de `efail`:** A propriedade `efail` é usada para armazenar a URL do gateway de API que está falhando ou sendo testado. Isso permite que o interceptador "lembre" qual gateway tentar em caso de falhas consecutivas. O valor de `efail` é persistido no `localStorage`.  
 */
@Injectable()
export class AuthorizationHttpInterceptor implements HttpInterceptor {
    private _refreshing = false;
    private _refreshInFlight$?: Observable<{ authorization?: string }>;
    private _pipocate: number = 0;
    private _efail?: string | number | undefined;
    public get efail(): string | number | undefined {
        return this._efail;
    }
    public set efail(value: string | number | undefined) {
        if (this._efail === value) return;
        this._efail = value;
        if (!!value) {
            localStorage.setItem('e-fail', JSON.stringify(value));
        } else {
            localStorage.removeItem('e-fail');
        }
    }
    constructor(
        @Optional() private readonly router: Router,
        @Optional() private readonly storage: StorageService,
        @Optional() private readonly auth: AuthService,
        @Optional() private readonly message: Message,
        private readonly injector: Injector,
        @Optional() private readonly consoleService?: ConsoleService,
        @Optional() @Inject(CORE_ENV) private readonly config?: ICoreEnvironment,
    ) {
        let efail = typeof localStorage !== 'undefined' ? localStorage.getItem('e-fail') : null;
        if (!!efail) {
            try {
                this.efail = JSON.parse(efail);
            } catch (error) {
                console.trace(error);
            }
        }
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return this._executeRequest(request, next);
    }

    /**
     * Executa a requisição HTTP aplicando gateway alternativo quando configurado.
     */
    private _executeRequest(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const { url } = request;
        if (this.config && this.config.alternativeApiGateways && this.config.rootApi) {
            if (!!this._efail && typeof this.efail === 'string') {
                request = request.clone({
                    url: url.replace(/((http|ws)[s]{0,1}:\/\/[\w.]{0,}[:]{0,1}[\d]{0,5})/g, this.efail)
                });
            }
        }
        return this._eTry(request, next) as any;
    }

    private _eTry(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(this.addBearerToken(request))
            .pipe(timeout({
                each: 15000,
                with: () => { throw new HttpErrorResponse({ status: 0, statusText: 'Interceptor Timeout' }); }
            }))
            .pipe(catchError((error) => {
                if (error) {
                    if (!request.url.includes('/Logger')) {
                        const isServerError = error?.status >= 500 || error?.status === 0;
                        if (isServerError) {
                            this.consoleService?.error(
                                `[HTTP Error ${error?.status || 0}] ${request.method} ${request.url}`,
                                {
                                    url: request.url,
                                    method: request.method,
                                    status: error?.status,
                                    statusText: error?.statusText,
                                    error: error?.error || error?.message,
                                },
                                true,
                                error?.status >= 500,
                            );
                        }
                    }
                    if (error?.error?.error?.options?.message?.indexOf('expirou') > -1) {
                        this.storage?.clean();
                        this.router?.navigate(['/']);
                        return throwError(() => error);
                    }
                    if (error?.error?.message?.indexOf('Acesso negado. Não corresponde ao nível de acesso necessário.') > -1) {
                        setTimeout(() => {
                            this.router?.navigate(['/']);
                        });
                        return throwError(() => undefined);
                    }
                    if (error instanceof HttpErrorResponse && (error.status === 0 || error.status === 404)) {
                        const isAuthEndpoint = request.url.includes('/auth/Acessar') || request.url.includes('/auth/Refresh');
                        if (!isAuthEndpoint && this.config && Array.isArray(this.config.alternativeApiGateways)) {
                            const gateways_list = this.config.alternativeApiGateways
                                .filter(url => url.indexOf('http') === 0);
                            if (gateways_list.length > 0) {
                                this.efail = gateways_list['string' === typeof this.efail ? gateways_list.indexOf(this.efail) + 1 : 0];
                                if (this._pipocate++ < gateways_list.length) {
                                    return this._executeRequest(request, next);
                                } else {
                                    setTimeout(() => {
                                        this._pipocate = 0;
                                    }, 1000);
                                }
                            }
                        }
                    } else if (error instanceof HttpErrorResponse) {
                        return this.handlerUnauthorizedError(error, next, request);
                    }
                }
                return throwError(() => error);
            }));
    }

    private addBearerToken(request: HttpRequest<any>): HttpRequest<any> {
        let bearer: string | undefined = undefined;
        const isApiRequest =
            request.url.startsWith('https://apps.ci.dev.br') ||
            (!!this.config?.rootApi && request.url.startsWith(this.config.rootApi)) ||
            (Array.isArray(this.config?.alternativeApiGateways) && this.config!.alternativeApiGateways.some(gw => request.url.startsWith(gw))) ||
            request.url.startsWith('/');

        if (isApiRequest && this.storage) {
            const user_storage: any = this.storage.restore('apps.ci.dev.br.store.User');
            if (user_storage?.authentication?.bearer) {
                bearer = user_storage.authentication.bearer;
            }
        }
        return bearer ? request.clone({
            headers: new HttpHeaders({
                timeout: '10000',
                'Authorization': `Bearer ${bearer}`
            })
        }) : request;
    }

    /**
     * Trata erros 401/408 realizando um único Refresh compartilhado para todas as requisições simultâneas.
     */
    private handlerUnauthorizedError(
        error: HttpErrorResponse,
        next: HttpHandler,
        request: HttpRequest<any>
    ): Observable<HttpEvent<any>> {
        // Evita loop infinito se a própria rota de Refresh ou Acessar retornar 401/408
        if (request.url.includes('/auth/Refresh') || request.url.includes('/auth/Acessar')) {
            return throwError(() => error);
        }

        if (error?.status === 401 || error?.status === 408) {
            const user: { authentication?: { bearer?: string, refreshToken?: string } } =
                this.storage?.restore('apps.ci.dev.br.store.User');

            if (user?.authentication?.refreshToken && this.auth) {
                if (!this._refreshInFlight$) {
                    this._refreshing = true;
                    this._refreshInFlight$ = this.auth.refresh({
                        body: {
                            refreshToken: user.authentication.refreshToken
                        }
                    }).pipe(
                        switchMap(async (token: { authorization?: string }) => {
                            if (token?.authorization) {
                                const latestUser = this.storage?.restore('apps.ci.dev.br.store.User') || user;
                                if (latestUser?.authentication) {
                                    latestUser.authentication.bearer = token.authorization;
                                    this.storage?.store('apps.ci.dev.br.store.User', latestUser);
                                }
                            }
                            return token;
                        }),
                        finalize(() => {
                            this._refreshing = false;
                            this._refreshInFlight$ = undefined;
                        }),
                        shareReplay(1)
                    );
                }

                return this._refreshInFlight$.pipe(
                    switchMap(() => next.handle(this.addBearerToken(request))),
                    catchError(refreshErr => throwError(() => refreshErr))
                );
            }
        }

        return throwError(() => error);
    }
}