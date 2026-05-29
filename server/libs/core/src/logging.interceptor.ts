import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { catchError, EMPTY, Observable, tap } from 'rxjs';
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        console.log('Before...', context.getClass().name, context.getHandler().name);
        const now = Date.now();
        return next
            .handle()
            .pipe(
                catchError(error => {
                    console.trace(context.getClass().name, context.getHandler().name, error)
                    return EMPTY
                })
            ).pipe(
                tap(() => console.log(`After... ${Date.now() - now}ms`)),
            )

    }
}