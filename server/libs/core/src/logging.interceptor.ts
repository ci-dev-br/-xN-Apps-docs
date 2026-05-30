import { Injectable, NestInterceptor, ExecutionContext, CallHandler, RequestTimeoutException } from '@nestjs/common';
import { catchError, EMPTY, Observable, tap, throwError, timeout, TimeoutError } from 'rxjs';
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        // const TIMEOUT_MS = 700;
        // console.log('Before...', context.getClass().name, context.getHandler().name);
        // const now = Date.now();
        return next
            .handle()
        /* .pipe(
            timeout(TIMEOUT_MS),
            catchError((err) => {
                if (err instanceof TimeoutError) {
                    // Retorna um erro HTTP 408 caso o tempo se esgote
                    return throwError(() => new RequestTimeoutException('Tempo de requisição esgotado.'));
                }
                return throwError(() => err);
            })) */
        /*  .pipe(
             catchError(error => {
                 console.trace(context.getClass().name, context.getHandler().name, error)
                 return EMPTY
             })
         ) *//* .pipe(
         tap(() => console.log(`After... ${Date.now() - now}ms`)),
     ); */
    }
}