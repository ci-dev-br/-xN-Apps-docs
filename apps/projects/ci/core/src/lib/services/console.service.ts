import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Inject, Injectable, Optional } from "@angular/core";
import { Observable, of } from "rxjs";
import { catchError } from "rxjs/operators";
import { StorageService } from "../storage/storage.service";
import { CORE_ENV, ICoreEnvironment } from "../provider";

export interface ClientLogPayload {
    message?: string;
    log: any;
    level?: 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'fatal';
    origem?: string;
    application?: string;
    chaveAcessoReference?: string;
    userId?: string;
    userEmail?: string;
    userRoles?: string[];
    userCredentials?: {
        id?: string;
        username?: string;
        email?: string;
        roles?: string[];
        chaveAcesso?: string;
        permissions?: any;
        ip?: string;
        userAgent?: string;
        [key: string]: any;
    };
    status?: string;
    deveCorrigir?: boolean;
    dispararAlerta?: boolean;
    alertaDisparado?: boolean;
    alertDetails?: any;
    metadata?: {
        url?: string;
        pathname?: string;
        userAgent?: string;
        screenResolution?: string;
        language?: string;
        timestamp?: string;
        [key: string]: any;
    };
}

/**
 * Serviço de Consumo e Catalogação de Logs do Cliente (Angular)
 * Coleta informações de contexto, credenciais de acesso do usuário,
 * estado de correção do log e parâmetros de disparo de alertas.
 */
@Injectable({
    providedIn: 'root',
})
export class ConsoleService {
    private isInitialized = false;

    constructor(
        @Optional() private readonly http?: HttpClient,
        @Optional() private readonly storage?: StorageService,
        @Optional() @Inject(CORE_ENV) private readonly config?: ICoreEnvironment,
    ) { }

    /**
     * Inicializa a captura automática de erros não tratados no navegador
     */
    public initGlobalErrorHandler() {
        if (this.isInitialized || typeof window === 'undefined') return;
        this.isInitialized = true;

        window.addEventListener('error', (event: ErrorEvent) => {
            this.error(
                event.message || 'Erro não tratado no cliente',
                {
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno,
                    error: event.error?.stack || event.error,
                },
                true,
                true,
            );
        });

        window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
            this.error(
                'Promise Rejection não tratada no cliente',
                {
                    reason: event.reason?.stack || event.reason,
                },
                true,
                false,
            );
        });
    }

    /**
     * Obtém as credenciais de acesso do usuário salvas no storage local
     */
    public getUserCredentials(): {
        userId?: string;
        userEmail?: string;
        userRoles?: string[];
        chaveAcesso?: string;
        raw?: any;
    } {
        if (!this.storage) return {};

        try {
            const userStore: any = this.storage.restore('apps.ci.dev.br.store.User');
            if (!userStore) return {};

            const auth = userStore.authentication;
            const bearer = auth?.bearer;
            const user = userStore.user || userStore;

            return {
                userId: user?.id || userStore?.id,
                userEmail: user?.email || userStore?.email,
                userRoles: user?.roles || userStore?.roles || [],
                chaveAcesso: bearer,
                raw: {
                    id: user?.id || userStore?.id,
                    username: user?.username || user?.nome || userStore?.nome,
                    email: user?.email || userStore?.email,
                    roles: user?.roles || userStore?.roles || [],
                    chaveAcesso: bearer ? bearer.replace('Bearer ', '') : undefined,
                    permissions: user?.permissions || userStore?.permissions,
                },
            };
        } catch {
            return {};
        }
    }

    /**
     * Monta metadados do navegador e contexto de execução
     */
    private getBrowserMetadata() {
        if (typeof window === 'undefined') return {};

        return {
            url: window.location.href,
            pathname: window.location.pathname,
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
            language: typeof navigator !== 'undefined' ? navigator.language : undefined,
            screenResolution: typeof screen !== 'undefined' ? `${screen.width}x${screen.height}` : undefined,
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * Envia o log para catalogação no servidor
     */
    public send(payload: Partial<ClientLogPayload>): Observable<any> {
        if (!this.http) {
            return of(null);
        }

        const creds = this.getUserCredentials();
        const browserMeta = this.getBrowserMetadata();

        const fullPayload: ClientLogPayload = {
            message: payload.message || (typeof payload.log === 'string' ? payload.log : 'Log do Cliente'),
            log: payload.log,
            level: payload.level || 'info',
            origem: payload.origem || 'CLIENT_ANGULAR',
            application: payload.application || 'ci-apps',
            chaveAcessoReference: payload.chaveAcessoReference || creds.chaveAcesso,
            userId: payload.userId || creds.userId,
            userEmail: payload.userEmail || creds.userEmail,
            userRoles: payload.userRoles || creds.userRoles,
            userCredentials: {
                ...(creds.raw || {}),
                ...(payload.userCredentials || {}),
                userAgent: browserMeta.userAgent,
            },
            status: payload.status || 'NOVO',
            deveCorrigir: payload.deveCorrigir ?? (payload.level === 'error' || payload.level === 'fatal'),
            dispararAlerta: payload.dispararAlerta ?? (payload.level === 'fatal'),
            alertaDisparado: payload.alertaDisparado ?? false,
            alertDetails: payload.alertDetails || null,
            metadata: {
                ...browserMeta,
                ...(payload.metadata || {}),
            },
        };

        const root = this.config?.rootApi ? this.config.rootApi.replace(/\/$/, '') : '';
        const endpoint = `${root}/Logger/Client`;

        let headers = new HttpHeaders({
            'Content-Type': 'application/json',
        });

        if (creds.chaveAcesso) {
            const token = creds.chaveAcesso.startsWith('Bearer ')
                ? creds.chaveAcesso
                : `Bearer ${creds.chaveAcesso}`;
            headers = headers.set('Authorization', token);
        }

        return this.http.post(endpoint, fullPayload, { headers }).pipe(
            catchError((err) => {
                // Falha silenciosa para não quebrar a aplicação do cliente em caso de erro no log
                console.warn('[ConsoleService] Falha ao enviar log para o servidor:', err?.message || err);
                return of(null);
            }),
        );
    }

    /**
     * Log de nível INFO
     */
    public info(message: string, data?: any) {
        this.send({
            message,
            log: data || { message },
            level: 'info',
            deveCorrigir: false,
            dispararAlerta: false,
        }).subscribe();
    }

    /**
     * Log de nível WARN
     */
    public warn(message: string, data?: any, deveCorrigir = false) {
        this.send({
            message,
            log: data || { message },
            level: 'warn',
            deveCorrigir,
            dispararAlerta: false,
        }).subscribe();
    }

    /**
     * Log de nível ERROR
     * Cataloga erro do cliente contendo credenciais, se deve ser corrigido e se dispara alerta
     */
    public error(
        message: string,
        error?: any,
        deveCorrigir = true,
        dispararAlerta = false,
        alertDetails?: any,
    ) {
        const errorData = error instanceof Error
            ? { name: error.name, message: error.message, stack: error.stack }
            : error;

        this.send({
            message,
            log: errorData || { message },
            level: 'error',
            deveCorrigir,
            dispararAlerta,
            alertDetails,
        }).subscribe();
    }

    /**
     * Captura exceção com stack trace
     */
    public captureException(error: Error | any, context?: any) {
        const message = error?.message || String(error) || 'Exceção capturada no cliente';
        this.error(message, {
            error: error?.stack || error,
            context,
        }, true, true);
    }
}