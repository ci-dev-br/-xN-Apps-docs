import { HttpErrorResponse, HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError, switchMap } from "rxjs/operators";
import { StorageService } from "../storage/storage.service";
// import { AuthService } from "@ci/portal-api";
@Injectable()
export class AuthorizationHttpInterceptor implements HttpInterceptor {
    private refreshing?: boolean;
    constructor(
        private readonly storage: StorageService,
        // private readonly token: TokenService,
        // private readonly auth: AuthService,
    ) {
        console.log('[SEC.v-2.3.33401.2]');
    }
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const { method, url } = request;
        return next.handle(this.addTokenHeader(request)).pipe(catchError(error => {
            if (error) {
                /// if (error instanceof HttpErrorResponse /* && this.token.hasRefreshToken() */) {
                ///     return this.handlerUnauthorizedError(error, next, request);
                /// }
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
    // private handlerUnauthorizedError(error: HttpErrorResponse, next: HttpHandler, request: HttpRequest<any>) {
    //     this.refreshing = true;
    //     if (error?.status === 401) {
    //         return this.auth.refresh({
    //             body: {
    //                 refreshToken: this.token.RefreshToken
    //             }
    //         }).pipe(
    //             switchMap((token: any) => {
    //                 this.refreshing = false;
    // 
    //                 this.token.Token = token.authorization;
    //                 return next.handle(this.addTokenHeader(request));
    //             }), catchError(error => {
    //                 // this.refreshing = false;
    //                 // this.token.clear();
    //                 return throwError(error);
    //             })
    //         )
    //     } else {
    //         return throwError(error);
    //     }
    // }
}