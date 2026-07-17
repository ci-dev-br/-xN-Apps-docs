import { Injectable, NestInterceptor, ExecutionContext, CallHandler, RequestTimeoutException } from '@nestjs/common';
import { catchError, Observable, tap, throwError, timeout, TimeoutError } from 'rxjs';
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const TIMEOUT_MS = 700;
        // console.log('Before...', context.getClass().name, context.getHandler().name);
        const request = context.switchToHttp()?.getRequest()
        // console.log(`[${request.url}] ${request.method} `);
        // console.log(...Object.keys(request.headers).map((p) => {
        //     return `${p} > ${request.headers[p]};`;
        // }))
        const now = Date.now();
        return next
            .handle()
            .pipe(
                timeout(TIMEOUT_MS),
                catchError((err) => {
                    if (err instanceof TimeoutError) {
                        // Retorna um erro HTTP 408 caso o tempo se esgote
                        return throwError(() => new RequestTimeoutException('Tempo de requisição esgotado.'));
                    }
                    return throwError(() => err);
                }))
        /*  .pipe(
             catchError(error => {
                 console.trace(context.getClass().name, context.getHandler().name, error)
                 return EMPTY
             })
         ) */ .pipe(tap(() => console.log(`${request.url} ${request.method} :: ${context.getClass().name} ${context.getHandler().name} ${Date.now() - now}ms`)),);
    }
}