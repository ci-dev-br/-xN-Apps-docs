import { HttpErrorResponse, HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Inject, Injectable, Optional } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError, switchMap } from "rxjs/operators";
import { StorageService } from "../storage/storage.service";
import { AuthService } from "@ci/portal-api";
import { CORE_ENV, ICoreEnvironment } from "../provider";
// import { AuthService } from "@ci/portal-api";
@Injectable()
export class AuthorizationHttpInterceptor implements HttpInterceptor {
    private refreshing?: boolean;
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
        private readonly storage: StorageService,
        private readonly auth: AuthService,
        @Optional() @Inject(CORE_ENV) private readonly config?: ICoreEnvironment,
    ) {
        let efail = localStorage.getItem('e-fail');
        if (!!efail) {
            try {
                this._efail = JSON.parse(efail);
            } catch (error) {
                console.error(error);
            }
        }
    }
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const { method, url } = request;
        if (this.config && this.config.alternativeApiGateways && this.config.rootApi) {
            if (url.indexOf(this.config.rootApi) === 0 && !!this._efail && typeof this._efail === 'string') {
                request = request.clone({
                    url: url.replace(this.config.rootApi, this._efail)
                })
            }
        }
        return this._eTry(request, next)
    }
    private _eTry(request: HttpRequest<any>, next: HttpHandler) {
        return next.handle(this.addTokenHeader(request)).pipe(catchError(error => {
            if (error) {
                if (error instanceof HttpErrorResponse && error.status === 0) {
                    if (this.config && Array.isArray(this.config.alternativeApiGateways)) {
                        if (!this._efail)
                            this.efail = this.config.alternativeApiGateways[0];
                        else if (this._efail === this.config.alternativeApiGateways[0])
                            this.efail = this.config.alternativeApiGateways[1];
                        else if (this._efail === this.config.alternativeApiGateways[1])
                            this.efail = undefined;
                        // alternate url and retry
                        return next.handle(this.addTokenHeader(request));
                    }
                } else if (error instanceof HttpErrorResponse /* && this.token.hasRefreshToken() */) {
                    return this.handlerUnauthorizedError(error, next, request);
                }
            }
            return throwError(error);
        }));
    }
    private addTokenHeader(request: HttpRequest<any>) {
        let bearer = undefined;
        let user_storage: any = null;
        if (user_storage = this.storage.restore('apps.ci.dev.br.store.User')) {
            if (user_storage?.authentication?.bearer) bearer = user_storage.authentication.bearer;
        }
        return bearer ? request.clone({
            headers: new HttpHeaders({
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
                        return next.handle(this.addTokenHeader(request));
                    }), catchError(error => {
                        return throwError(error);
                    })
                )

        }
        return throwError(error);
    }
}