import { Injectable, NestInterceptor, ExecutionContext, CallHandler, RequestTimeoutException } from '@nestjs/common';
import { catchError, Observable, tap, throwError, timeout, TimeoutError } from 'rxjs';
import { LoggerService } from './logger/logger.service';
import { LogLevel, LogStatus } from './logger/log.entity';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const TIMEOUT_MS = 30000;
        const request = context.switchToHttp()?.getRequest();
        const now = Date.now();

        return next
            .handle()
            .pipe(
                timeout(TIMEOUT_MS),
                catchError((err) => {
                    try {
                        const loggerService = LoggerService.getInstance();
                        if (loggerService && request && !request.url?.includes('/Logger')) {
                            const isTimeout = err instanceof TimeoutError;
                            const status = err?.status || err?.statusCode || (isTimeout ? 408 : 500);
                            const isServerError = status >= 500 || !err?.status;
                            const message = `[HTTP ${status}] ${request.method} ${request.url} - ${err?.message || 'Erro de execução'}`;

                            loggerService.registerServerLog({
                                message,
                                log: {
                                    error: err?.message,
                                    stack: err?.stack,
                                    name: err?.name,
                                    status,
                                    controller: context.getClass()?.name,
                                    handler: context.getHandler()?.name,
                                },
                                level: isServerError ? LogLevel.ERROR : LogLevel.WARN,
                                status: isServerError ? LogStatus.NEW : LogStatus.RESOLVED,
                                deveCorrigir: isServerError,
                                dispararAlerta: isServerError,
                                metadata: {
                                    url: request.url,
                                    method: request.method,
                                    statusCode: status,
                                    durationMs: Date.now() - now,
                                },
                            }, request).catch(() => { });
                        }
                    } catch { }

                    if (err instanceof TimeoutError) {
                        return throwError(() => new RequestTimeoutException('Tempo de requisição esgotado.'));
                    }
                    return throwError(() => err);
                }),
                tap(() => {
                    // Opcional: log informativo de console
                    if (request?.url && !request.url.includes('/__orchestration/health')) {
                        console.log(`${request.url} ${request.method} :: ${context.getClass()?.name} ${context.getHandler()?.name} ${Date.now() - now}ms`);
                    }
                }),
            );
    }
}