import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Inject, Injectable, Injector, Optional } from "@angular/core";
import { from, Observable, of, throwError } from "rxjs";
import { catchError, finalize, shareReplay, switchMap, timeout } from "rxjs/operators";
import { StorageService } from "../storage/storage.service";
import { AuthService } from "@ci/portal-api";
import { CORE_ENV, ICoreEnvironment } from "../provider";
import { Router } from "@angular/router";
import { Message } from "../services/message";
import { ConsoleService } from "../services/console.service";
import { GIT_VERSION } from "../version/git-version";
import { ApplicationCatalogService } from "../apps/application-catalog.service";
import { AccessKeyCryptoService } from "../auth/access-key-crypto.service";
import {
    USER_STORE_KEY,
    extractChaveAcessoFromSession,
    getActiveAccessScope,
    getSecondaryAccountTokens,
    isJwtExpired,
    isJwtExpiringSoon,
    updateAccountTokensInStorage,
} from "../auth/client-session-storage";

interface RefreshResult {
    authorization?: string;
    refreshToken?: string | null;
    chaveAcesso?: string | null;
}

/**
 * Interceptador de requisições HTTP responsável por:
 * 1. Anexar o Bearer Token da conta ativa, tokens secundários (`x-additional-tokens`) e escopo de acesso (`X-Access-Scope`).
 * 2. Realizar refresh proativo (quando o JWT está próximo de expirar) e reativo (em 401) com single-flight por `chaveAcesso`.
 * 3. Assinar snapshots de requisições `/Sync` (ou payloads `{ data }`) com a chave privada do acesso armazenada em IndexedDB.
 * 4. Alternar para gateways alternativos em falhas de rede/404.
 */
@Injectable()
export class AuthorizationHttpInterceptor implements HttpInterceptor {
    private _refreshInFlightByKey = new Map<string, Observable<RefreshResult>>();
    private _pipocate: number = 0;
    private _efail?: string | number | undefined;

    constructor(
        @Optional() private readonly router: Router,
        @Optional() private readonly storage: StorageService,
        @Optional() private readonly auth: AuthService,
        @Optional() private readonly message: Message,
        private readonly injector: Injector,
        @Optional() private readonly consoleService?: ConsoleService,
        @Optional() @Inject(CORE_ENV) private readonly config?: ICoreEnvironment,
        @Optional() private readonly accessKeyCrypto?: AccessKeyCryptoService,
    ) {
        const efail = typeof localStorage !== 'undefined' ? localStorage.getItem('e-fail') : null;
        if (efail) {
            try {
                this.efail = JSON.parse(efail);
            } catch (error) {
                console.trace(error);
            }
        }
    }

    public get efail(): string | number | undefined {
        return this._efail;
    }

    public set efail(value: string | number | undefined) {
        if (this._efail === value) return;
        this._efail = value;
        if (typeof localStorage !== 'undefined') {
            if (value) {
                localStorage.setItem('e-fail', JSON.stringify(value));
            } else {
                localStorage.removeItem('e-fail');
            }
        }
    }

    private isApiRequest(url: string): boolean {
        return (
            url.startsWith('https://apps.ci.dev.br') ||
            (!!this.config?.rootApi && url.startsWith(this.config.rootApi)) ||
            (Array.isArray(this.config?.alternativeApiGateways) && this.config!.alternativeApiGateways.some(gw => url.startsWith(gw))) ||
            url.startsWith('/')
        );
    }

    private isAuthEndpoint(url: string): boolean {
        return (
            url.includes('/auth/Acessar') ||
            url.includes('/auth/Refresh') ||
            url.includes('/auth/Registrar')
        );
    }

    private shouldSignSnapshot(request: HttpRequest<any>): boolean {
        if (!this.isApiRequest(request.url) || this.isAuthEndpoint(request.url)) return false;
        if (request.url.includes('/Logger')) return false;
        if (!['POST', 'PUT', 'PATCH'].includes(request.method.toUpperCase())) return false;
        if (request.body instanceof FormData) return false;
        return (
            request.url.endsWith('/Sync') ||
            request.url.includes('/Sync?') ||
            request.headers.has('X-Sign-Snapshot') ||
            Boolean(request.body && typeof request.body === 'object' && 'data' in request.body)
        );
    }

    private prepareSignedRequest(request: HttpRequest<any>): Observable<HttpRequest<any>> {
        if (!this.accessKeyCrypto?.isSupported || !this.shouldSignSnapshot(request)) {
            return of(request);
        }
        const session = this.storage?.restore(USER_STORE_KEY);
        const chaveAcesso = extractChaveAcessoFromSession(session);
        if (!chaveAcesso) {
            return of(request);
        }
        const targetPayload = request.body && typeof request.body === 'object' && 'data' in request.body
            ? request.body.data
            : request.body;

        return from(this.accessKeyCrypto.signSnapshot(chaveAcesso, targetPayload)).pipe(
            switchMap(envelope => {
                if (!envelope) return of(request);
                return of(request.clone({
                    setHeaders: {
                        'X-Access-Key': envelope.chaveAcesso,
                        'X-Snapshot-Hash': envelope.hash,
                        'X-Snapshot-Payload-Hash': envelope.payloadHash,
                        'X-Snapshot-Signature': envelope.signature,
                        'X-Snapshot-Timestamp': envelope.signedAt,
                        'X-Snapshot-Algorithm': envelope.algorithm,
                    }
                }));
            }),
            catchError(() => of(request)),
        );
    }

    private _executeRequest(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const { url } = request;
        if (this.config && this.config.alternativeApiGateways && this.config.rootApi) {
            if (!!this._efail && typeof this.efail === 'string') {
                request = request.clone({
                    url: url.replace(/((http|ws)[s]{0,1}:\/\/[\w.]{0,}[:]{0,1}[\d]{0,5})/g, this.efail)
                });
            }
        }
        return this._eTry(request, next);
    }

    private _eTry(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return this.prepareSignedRequest(request).pipe(
            switchMap(signedReq =>
                next.handle(this.addBearerToken(signedReq))
                    .pipe(timeout({
                        each: 15000,
                        with: () => { throw new HttpErrorResponse({ status: 0, statusText: 'Interceptor Timeout' }); }
                    }))
                    .pipe(catchError((error) => {
                        if (error) {
                            if (!signedReq.url.includes('/Logger')) {
                                const isServerError = error?.status >= 500 || error?.status === 0;
                                if (isServerError) {
                                    this.consoleService?.error(
                                        `[HTTP Error ${error?.status || 0}] ${signedReq.method} ${signedReq.url}`,
                                        {
                                            url: signedReq.url,
                                            method: signedReq.method,
                                            status: error?.status,
                                            statusText: error?.statusText,
                                            error: error?.error || error?.message,
                                        },
                                        true,
                                        error?.status >= 500,
                                    );
                                }
                            }
                            if (error?.error?.message?.indexOf('Acesso negado. Não corresponde ao nível de acesso necessário.') > -1) {
                                setTimeout(() => {
                                    this.router?.navigate(['/']);
                                });
                                return throwError(() => undefined);
                            }
                            if (error instanceof HttpErrorResponse && (error.status === 0 || error.status === 404)) {
                                const skipFallback = signedReq.url.includes('/auth/Acessar');
                                if (!skipFallback && this.config && Array.isArray(this.config.alternativeApiGateways)) {
                                    const gateways_list = this.config.alternativeApiGateways
                                        .filter(url => url.indexOf('http') === 0);
                                    if (gateways_list.length > 0) {
                                        this.efail = gateways_list['string' === typeof this.efail ? gateways_list.indexOf(this.efail) + 1 : 0];
                                        if (this._pipocate++ < gateways_list.length) {
                                            return this._executeRequest(signedReq, next);
                                        } else {
                                            setTimeout(() => {
                                                this._pipocate = 0;
                                            }, 1000);
                                        }
                                    }
                                }
                            } else if (error instanceof HttpErrorResponse) {
                                return this.handlerUnauthorizedError(error, next, signedReq);
                            }
                        }
                        return throwError(() => error);
                    }))
            )
        );
    }

    private addBearerToken(request: HttpRequest<any>): HttpRequest<any> {
        let bearer: string | undefined = undefined;
        let chaveAcesso: string | undefined = undefined;

        if (this.isApiRequest(request.url) && this.storage) {
            const user_storage: any = this.storage.restore(USER_STORE_KEY);
            if (user_storage?.authentication?.bearer) {
                bearer = user_storage.authentication.bearer;
            }
            chaveAcesso = extractChaveAcessoFromSession(user_storage);
        }

        const originApp = ApplicationCatalogService.currentAppKey ||
            ApplicationCatalogService.detectFromUrl(this.router?.url || (typeof window !== 'undefined' ? window.location.pathname : '')) ||
            'Portal';
        const cleanKey = originApp.replace(/^\//, '').trim();
        const appGit = (GIT_VERSION as any).getAppGitInfo?.(cleanKey) || (GIT_VERSION as any).applications?.[cleanKey] || (GIT_VERSION as any).applications?.[cleanKey.toLowerCase()];
        const gitHash = appGit?.shortHash || GIT_VERSION.shortHash;

        const headersConfig: { [key: string]: string } = {
            'X-Origin-Application': originApp,
            'X-Application-Git-Hash': gitHash
        };

        if (chaveAcesso && !request.headers.has('X-Access-Key')) {
            headersConfig['X-Access-Key'] = chaveAcesso;
        }

        const accessScope = getActiveAccessScope();
        if (accessScope && !request.headers.has('X-Access-Scope')) {
            headersConfig['X-Access-Scope'] = accessScope;
        }

        if (bearer && !request.headers.has('Authorization')) {
            headersConfig['timeout'] = '10000';
            headersConfig['Authorization'] = `Bearer ${bearer}`;
            const secondaryTokens = getSecondaryAccountTokens(bearer);
            if (secondaryTokens.length > 0) {
                headersConfig['x-additional-tokens'] = secondaryTokens.join(',');
            }
        }

        return request.clone({
            setHeaders: headersConfig
        });
    }

    private clearExpiredSession(chaveAcesso?: string): void {
        this.storage?.clean();
        if (chaveAcesso) {
            void this.accessKeyCrypto?.deleteKey(chaveAcesso);
        } else {
            void this.accessKeyCrypto?.clearAllKeys();
        }
        const currentUrl = this.router?.url;
        if (currentUrl && !currentUrl.startsWith('/acessar') && !currentUrl.startsWith('/registrar')) {
            this.router?.navigate(['/acessar'], {
                queryParams: currentUrl !== '/' ? { redirect: currentUrl } : undefined,
            });
        }
    }

    private performSingleFlightRefresh(chaveAcesso: string | undefined, refreshToken: string): Observable<RefreshResult> {
        const flightKey = chaveAcesso || '__default__';
        let inFlight$ = this._refreshInFlightByKey.get(flightKey);
        if (!inFlight$) {
            inFlight$ = this.auth.refresh({
                body: {
                    refreshToken,
                    chaveAcesso,
                } as any
            }).pipe(
                switchMap((token: RefreshResult) => {
                    if (!token?.authorization) {
                        return throwError(() => new HttpErrorResponse({
                            status: (token as any)?.status || 401,
                            statusText: 'Refresh Unauthorized',
                            error: token,
                        }));
                    }
                    updateAccountTokensInStorage(chaveAcesso, {
                        bearer: token.authorization,
                        refreshToken: token.refreshToken || undefined,
                        chaveAcesso: token.chaveAcesso || chaveAcesso,
                    });
                    return of(token);
                }),
                finalize(() => {
                    this._refreshInFlightByKey.delete(flightKey);
                }),
                shareReplay(1)
            );
            this._refreshInFlightByKey.set(flightKey, inFlight$);
        }
        return inFlight$;
    }

    /**
     * Trata erros 401 realizando um único Refresh compartilhado por `chaveAcesso`.
     */
    private handlerUnauthorizedError(
        error: HttpErrorResponse,
        next: HttpHandler,
        request: HttpRequest<any>
    ): Observable<HttpEvent<any>> {
        if (this.isAuthEndpoint(request.url)) {
            return throwError(() => error);
        }
        if (error?.status === 401) {
            const user: { authentication?: { bearer?: string; refreshToken?: string; chaveAcesso?: string }; chaveAcesso?: string } | undefined =
                this.storage?.restore(USER_STORE_KEY);
            const chaveAcesso = extractChaveAcessoFromSession(user);
            const refreshToken = user?.authentication?.refreshToken;

            if (!refreshToken || isJwtExpired(refreshToken, 0) || !this.auth) {
                if (user?.authentication?.bearer || refreshToken) {
                    this.clearExpiredSession(chaveAcesso);
                }
                return throwError(() => error);
            }

            return this.performSingleFlightRefresh(chaveAcesso, refreshToken).pipe(
                catchError(refreshErr => {
                    if (refreshErr?.status === 401) {
                        this.clearExpiredSession(chaveAcesso);
                    } else if (refreshErr?.status === 403) {
                        console.trace(refreshErr, this);
                    }
                    return throwError(() => refreshErr);
                }),
                switchMap(() => next.handle(this.addBearerToken(request))),
            );
        }
        return throwError(() => error);
    }

    public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (this.isApiRequest(request.url) && !this.isAuthEndpoint(request.url) && this.storage) {
            const user = this.storage.restore(USER_STORE_KEY);
            const bearer = user?.authentication?.bearer;
            const refreshToken = user?.authentication?.refreshToken;
            const chaveAcesso = extractChaveAcessoFromSession(user);

            if (bearer && isJwtExpiringSoon(bearer, 60)) {
                if (refreshToken && !isJwtExpired(refreshToken, 0) && this.auth) {
                    return this.performSingleFlightRefresh(chaveAcesso, refreshToken).pipe(
                        catchError((refreshErr) => {
                            if (refreshErr?.status === 401) {
                                this.clearExpiredSession(chaveAcesso);
                            }
                            return of(null);
                        }),
                        switchMap(() => this._executeRequest(request, next)),
                    );
                }
                if (!refreshToken || isJwtExpired(refreshToken, 0)) {
                    // Limpa sessão vencida antes de prosseguir para não enviar Bearer inválido em rotas públicas
                    this.storage.clean();
                    if (chaveAcesso) {
                        void this.accessKeyCrypto?.deleteKey(chaveAcesso);
                    }
                }
            }
        }
        return this._executeRequest(request, next);
    }
}
