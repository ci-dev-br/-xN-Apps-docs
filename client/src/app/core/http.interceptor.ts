import { HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
// import { StorageService } from './storage.service';
export class AuthorizationHttpInterceptor implements HttpInterceptor {
    constructor(
        // private readonly storage: StorageService,
    ) {

    }
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let bearer = undefined;
        const session_b64 = sessionStorage.getItem('SESSION[0]');
        if (session_b64) {
            const session = JSON.parse(atob(session_b64));
            if (session) {
                const info = JSON.parse(atob(session['__access_token']));
                if (info?.a) {
                    bearer = info?.a;
                }
            }
        }
        const { method, url } = req;
        return next.handle(
            bearer ? req.clone({
                headers: new HttpHeaders({
                    'Authorization': `Bearer ${bearer}`
                })
            }) : req
        );
    }
}