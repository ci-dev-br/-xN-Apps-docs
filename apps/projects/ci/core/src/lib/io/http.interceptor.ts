import { HttpErrorResponse, HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Inject, Injectable, Optional } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError, switchMap, timeout } from "rxjs/operators";
import { StorageService } from "../storage/storage.service";
import { AuthService } from "@ci/portal-api";
import { CORE_ENV, ICoreEnvironment } from "../provider";
import { Router } from "@angular/router";
// import { AuthService } from "@ci/portal-api";
@Injectable()
export class AuthorizationHttpInterceptor implements HttpInterceptor {
    private refreshing?: boolean;
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
        private readonly router: Router,
        private readonly storage: StorageService,
        private readonly auth: AuthService,
        @Optional() @Inject(CORE_ENV) private readonly config?: ICoreEnvironment,
    ) {
        let efail = localStorage.getItem('e-fail');
        if (!!efail) {
            try {
                this.efail = JSON.parse(efail);
            } catch (error) {
                console.error(error);
            }
        }
    }
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const { method, url } = request;
        if (this.config && this.config.alternativeApiGateways && this.config.rootApi) {
            if (!!this._efail && typeof this.efail === 'string') {
                request = request.clone({
                    url: url.replace(/((http|ws)[s]{0,1}:\/\/[\w.]{0,}[:]{0,1}[\d]{0,5})/g, this.efail)
                })
            }
        }
        return this._eTry(request, next)
    }
    private _eTry(request: HttpRequest<any>, next: HttpHandler) {
        return next.handle(this.addBearerToken(request))
            .pipe(timeout({ each: 1000, with: () => { throw new HttpErrorResponse({ status: 0, statusText: 'Interceptor Timeout' }) } }))
            .pipe(catchError(error => {
                if (error) {
                    if (error?.error?.message?.indexOf('Acesso negado. Não corresponde ao nível de acesso necessário.') > -1) {
                        setTimeout(() => {
                            this.router.navigate(['/meus-apps']);
                        });
                        return throwError(undefined);
                    }
                    if (error instanceof HttpErrorResponse && (error.status === 0 || error.status === 404)) {
                        if (this.config && Array.isArray(this.config.alternativeApiGateways)) {

                            let lista = (this.config.alternativeApiGateways
                                .filter(url => url.indexOf('http') === 0)
                            );
                            this.efail = lista['string' === typeof this.efail ? lista.indexOf(this.efail) + 1 : 0];
                            if (this._pipocate++ < 100) {
                                return this.intercept(request, next);
                            } else {
                                setTimeout(() => {
                                    this._pipocate = 0;
                                }, 1000);
                            }
                        }
                    } else if (error instanceof HttpErrorResponse /* && this.token.hasRefreshToken() */) {
                        return this.handlerUnauthorizedError(error, next, request);
                    }
                }
                return throwError(error);
            }));
    }
    private addBearerToken(request: HttpRequest<any>) {
        let bearer = undefined;
        let user_storage: any = null;
        if (user_storage = this.storage.restore('apps.ci.dev.br.store.User')) {
            if (user_storage?.authentication?.bearer) bearer = user_storage.authentication.bearer;
        }
        return bearer ? request.clone({
            headers: new HttpHeaders({
                timeout: '1000',
                'Authorization': `Bearer ${bearer}`
            })
        }) : request;
    }
    private handlerUnauthorizedError(error: HttpErrorResponse, next: HttpHandler, request: HttpRequest<any>) {
        this.refreshing = true;
        if (error?.status === 401) {
            let user: { authentication: { bearer: string, refreshToken: string } } = this.storage.restore('apps.ci.dev.br.store.User');
            user;
            if (!!user?.authentication?.refreshToken)
                return this.auth.refresh({
                    body: {
                        refreshToken: user.authentication.refreshToken
                    }
                }).pipe(
                    switchMap((token: { authorization: string }) => {
                        this.refreshing = false;
                        user.authentication.bearer = token.authorization;
                        this.storage.store('apps.ci.dev.br.store.User', user);
                        return next.handle(this.addBearerToken(request));
                    }), catchError(error => {
                        return throwError(error);
                    })
                )

        }
        return throwError(error);
    }
}