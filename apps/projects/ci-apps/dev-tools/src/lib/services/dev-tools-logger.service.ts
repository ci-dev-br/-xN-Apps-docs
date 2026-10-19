import { Inject, Injectable, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import {
    CreateLogDto,
    LogLevel,
    LogStatus,
    LogSummaryStats,
    QueryLogDto,
    QueryLogResponse,
    SystemLog,
    TriggerAlertDto,
    UpdateLogStateDto,
} from '../models/log.model';
import { DEVTOOLS_API_CONFIG, DevToolsApiConfig } from '../models/dev-tools.model';

@Injectable({
    providedIn: 'root',
})
export class DevToolsLoggerService {
    private localMockLogs: SystemLog[] = [];
    private usingMockFallback = false;

    constructor(
        private readonly http: HttpClient,
        @Optional() @Inject(DEVTOOLS_API_CONFIG) private readonly config?: DevToolsApiConfig,
    ) {
        this.initMockLogs();
    }

    private get baseUrl(): string {
        const root = this.config?.rootUrl || '';
        return root ? `${root.replace(/\/+$/, '')}/Logger` : '/Logger';
    }

    public isUsingMockFallback(): boolean {
        return this.usingMockFallback;
    }

    /**
     * Consulta paginada de logs do sistema
     */
    public query(queryDto: QueryLogDto = {}): Observable<QueryLogResponse> {
        return this.http.post<QueryLogResponse>(`${this.baseUrl}/Query`, queryDto).pipe(
            tap(() => {
                this.usingMockFallback = false;
            }),
            catchError((err) => {
                console.warn('[DevToolsLoggerService] Falha ao consultar endpoint /Logger/Query, usando mock fallback:', err);
                this.usingMockFallback = true;
                return of(this.filterMockLogs(queryDto));
            })
        );
    }

    /**
     * Consulta detalhes de um log por seu ID interno
     */
    public getById(id: string): Observable<SystemLog> {
        return this.http.get<SystemLog>(`${this.baseUrl}/${id}`).pipe(
            catchError((err) => {
                console.warn(`[DevToolsLoggerService] Falha ao buscar log ${id}, usando fallback:`, err);
                const found = this.localMockLogs.find((l) => l.internalId === id);
                if (found) return of(found);
                throw err;
            })
        );
    }

    /**
     * Atualiza o estado do log (deveCorrigir, status, dispararAlerta)
     */
    public updateState(dto: UpdateLogStateDto): Observable<SystemLog> {
        return this.http.post<SystemLog>(`${this.baseUrl}/UpdateState`, dto).pipe(
            tap((updated) => {
                const idx = this.localMockLogs.findIndex((l) => l.internalId === dto.internalId);
                if (idx !== -1) {
                    this.localMockLogs[idx] = updated;
                }
            }),
            catchError((err) => {
                console.warn('[DevToolsLoggerService] Falha ao atualizar estado no backend, atualizando mock:', err);
                const idx = this.localMockLogs.findIndex((l) => l.internalId === dto.internalId);
                if (idx !== -1) {
                    const current = this.localMockLogs[idx];
                    const updated: SystemLog = {
                        ...current,
                        status: dto.status !== undefined ? dto.status : current.status,
                        deveCorrigir: dto.deveCorrigir !== undefined ? dto.deveCorrigir : current.deveCorrigir,
                        dispararAlerta: dto.dispararAlerta !== undefined ? dto.dispararAlerta : current.dispararAlerta,
                        alertaDisparado: dto.alertaDisparado !== undefined ? dto.alertaDisparado : current.alertaDisparado,
                        alertDetails: dto.alertDetails !== undefined ? dto.alertDetails : current.alertDetails,
                        updatedAt: new Date(),
                    };
                    this.localMockLogs[idx] = updated;
                    return of(updated);
                }
                throw err;
            })
        );
    }

    /**
     * Dispara alerta manual para um log
     */
    public triggerAlert(dto: TriggerAlertDto): Observable<SystemLog> {
        return this.http.post<SystemLog>(`${this.baseUrl}/TriggerAlert`, dto).pipe(
            catchError((err) => {
                console.warn('[DevToolsLoggerService] Falha ao disparar alerta no backend, simulando no mock:', err);
                const idx = this.localMockLogs.findIndex((l) => l.internalId === dto.internalId);
                if (idx !== -1) {
                    const current = this.localMockLogs[idx];
                    const updated: SystemLog = {
                        ...current,
                        dispararAlerta: true,
                        alertaDisparado: true,
                        alertDetails: {
                            triggeredAt: new Date().toISOString(),
                            reason: dto.reason || 'Alerta disparado manualmente pelo DevTools',
                            channels: dto.channels || ['DEVTOOLS_CONSOLE', 'MASTER_EMAIL'],
                            extra: dto.extraDetails,
                        },
                        updatedAt: new Date(),
                    };
                    this.localMockLogs[idx] = updated;
                    return of(updated);
                }
                throw err;
            })
        );
    }

    /**
     * Ingestão de log de teste (Cliente ou Servidor)
     */
    public registerLog(dto: CreateLogDto): Observable<SystemLog> {
        const endpoint = dto.origem === 'CLIENT' ? `${this.baseUrl}/Client` : `${this.baseUrl}/Register`;
        return this.http.post<SystemLog>(endpoint, dto).pipe(
            catchError((err) => {
                console.warn('[DevToolsLoggerService] Falha ao registrar log via API, adicionando ao mock:', err);
                const newLog: SystemLog = {
                    internalId: 'mock-' + Math.random().toString(36).substring(2, 9),
                    level: dto.level || LogLevel.INFO,
                    message: dto.message || 'Log registrado via DevTools Simulator',
                    log: dto.log,
                    origem: dto.origem || 'DEVTOOLS',
                    application: dto.application || '@ci-apps/dev-tools',
                    status: dto.status || LogStatus.NEW,
                    deveCorrigir: dto.deveCorrigir ?? (dto.level === LogLevel.ERROR || dto.level === LogLevel.FATAL),
                    dispararAlerta: dto.dispararAlerta ?? (dto.level === LogLevel.FATAL),
                    alertaDisparado: dto.alertaDisparado ?? false,
                    alertDetails: dto.alertDetails,
                    metadata: dto.metadata || {
                        timestamp: new Date().toISOString(),
                        originUrl: window.location.href,
                        userAgent: navigator.userAgent,
                    },
                    cratedAt: new Date(),
                    updatedAt: new Date(),
                };
                this.localMockLogs.unshift(newLog);
                return of(newLog);
            })
        );
    }

    /**
     * Calcula estatísticas consolidadas
     */
    public computeSummaryStats(logs: SystemLog[]): LogSummaryStats {
        let errors = 0;
        let warns = 0;
        let toFix = 0;
        let resolved = 0;
        let alertsTriggered = 0;

        for (const log of logs) {
            const level = String(log.level || '').toLowerCase();
            if (level === 'error' || level === 'fatal') errors++;
            if (level === 'warn') warns++;
            if (log.deveCorrigir && log.status !== LogStatus.RESOLVED && log.status !== LogStatus.IGNORED) {
                toFix++;
            }
            if (log.status === LogStatus.RESOLVED) resolved++;
            if (log.alertaDisparado) alertsTriggered++;
        }

        return {
            total: logs.length,
            errors,
            warns,
            toFix,
            resolved,
            alertsTriggered,
        };
    }

    private filterMockLogs(queryDto: QueryLogDto): QueryLogResponse {
        let items = [...this.localMockLogs];

        if (queryDto.level && queryDto.level !== 'ALL') {
            items = items.filter((l) => String(l.level).toLowerCase() === String(queryDto.level).toLowerCase());
        }
        if (queryDto.origem && queryDto.origem !== 'ALL') {
            items = items.filter((l) => String(l.origem).toUpperCase().includes(String(queryDto.origem).toUpperCase()));
        }
        if (queryDto.status && queryDto.status !== 'ALL') {
            items = items.filter((l) => String(l.status).toUpperCase() === String(queryDto.status).toUpperCase());
        }
        if (queryDto.deveCorrigir !== undefined) {
            items = items.filter((l) => l.deveCorrigir === queryDto.deveCorrigir);
        }
        if (queryDto.dispararAlerta !== undefined) {
            items = items.filter((l) => l.dispararAlerta === queryDto.dispararAlerta);
        }
        if (queryDto.search) {
            const s = queryDto.search.toLowerCase();
            items = items.filter((l) =>
                (l.message && l.message.toLowerCase().includes(s)) ||
                (l.application && l.application.toLowerCase().includes(s)) ||
                (l.internalId && l.internalId.toLowerCase().includes(s))
            );
        }

        const total = items.length;
        const offset = queryDto.offset || 0;
        const limit = queryDto.limit || 50;
        const paged = items.slice(offset, offset + limit);

        return {
            items: paged,
            total,
            limit,
            offset,
        };
    }

    private initMockLogs(): void {
        const now = new Date();
        this.localMockLogs = [
            {
                internalId: 'err-1049-enoent',
                message: "ENOENT: no such file or directory, open 'server/libs/crm/src/models/crm.service.ts'",
                level: LogLevel.ERROR,
                origem: 'SERVER',
                application: 'server',
                status: LogStatus.NEW,
                deveCorrigir: true,
                dispararAlerta: true,
                alertaDisparado: true,
                alertDetails: {
                    triggeredAt: new Date(now.getTime() - 1000 * 60 * 12).toISOString(),
                    reason: 'Falha crítica ao resolver módulo TypeScript de CRM no build.',
                    channels: ['MASTER_SLACK', 'ADMIN_EMAIL'],
                },
                metadata: {
                    url: '/FileExplorer/File',
                    method: 'POST',
                    statusCode: 404,
                    ip: '127.0.0.1',
                    userAgent: 'Node.js/NestJS System Loader',
                    timestamp: new Date(now.getTime() - 1000 * 60 * 12).toISOString(),
                },
                log: {
                    name: 'Error',
                    code: 'ENOENT',
                    syscall: 'open',
                    path: 'C:\\projetos\\br.dev.ci.apps\\server\\libs\\crm\\src\\models\\crm.service.ts',
                    stack: "Error: ENOENT: no such file or directory, open 'C:\\projetos\\br.dev.ci.apps\\server\\libs\\crm\\src\\models\\crm.service.ts'\n    at Object.openSync (node:fs:580:18)\n    at Object.readFileSync (node:fs:459:35)\n    at ModuleLoader.loadSource (C:\\projetos\\br.dev.ci.apps\\server\\dist\\main.js:142:15)",
                },
                cratedAt: new Date(now.getTime() - 1000 * 60 * 12),
                updatedAt: new Date(now.getTime() - 1000 * 60 * 12),
            },
            {
                internalId: 'err-1050-monaco',
                message: 'Falha ao converter código em diagrama UML no Monaco Editor: tokens inválidos',
                level: LogLevel.WARN,
                origem: 'CLIENT_ANGULAR',
                application: '@ci-apps/Codex',
                status: LogStatus.IN_PROGRESS,
                deveCorrigir: true,
                dispararAlerta: false,
                alertaDisparado: false,
                metadata: {
                    url: '/Codex/editor?file=uml-viewer.ts',
                    method: 'GET',
                    statusCode: 200,
                    ip: '192.168.1.105',
                    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0',
                    timestamp: new Date(now.getTime() - 1000 * 60 * 35).toISOString(),
                },
                log: {
                    warning: 'ParserError: Nenhuma classe ou interface TypeScript encontrada no arquivo.',
                    component: 'UmlViewerComponent',
                    line: 42,
                    column: 8,
                },
                cratedAt: new Date(now.getTime() - 1000 * 60 * 35),
                updatedAt: new Date(now.getTime() - 1000 * 60 * 30),
            },
            {
                internalId: 'err-1051-conn',
                message: 'Conexão WebSocket reestabelecida após timeout de 15000ms',
                level: LogLevel.INFO,
                origem: 'SERVER',
                application: '@ci/core/events',
                status: LogStatus.RESOLVED,
                deveCorrigir: false,
                dispararAlerta: false,
                alertaDisparado: false,
                metadata: {
                    gateway: 'EventsGateway',
                    clientCount: 14,
                    latencyMs: 38,
                    timestamp: new Date(now.getTime() - 1000 * 60 * 60).toISOString(),
                },
                log: {
                    event: 'client_reconnected',
                    clientId: 'ws-sess-98214',
                    transport: 'websocket',
                },
                cratedAt: new Date(now.getTime() - 1000 * 60 * 60),
                updatedAt: new Date(now.getTime() - 1000 * 60 * 55),
            },
            {
                internalId: 'err-1052-mem',
                message: 'Variação de consumo de memória Heap excedeu threshold operacional (82% de uso)',
                level: LogLevel.WARN,
                origem: 'SERVER',
                application: 'system-monitor',
                status: LogStatus.PENDING,
                deveCorrigir: true,
                dispararAlerta: true,
                alertaDisparado: true,
                alertDetails: {
                    triggeredAt: new Date(now.getTime() - 1000 * 60 * 85).toISOString(),
                    reason: 'Alerta de sobrecarga de Heap Memory (480MB de 585MB alocados).',
                    channels: ['DEVTOOLS_SYSTEM_ALERT'],
                },
                metadata: {
                    rss: '612MB',
                    heapUsed: '480MB',
                    heapTotal: '585MB',
                    external: '45MB',
                    timestamp: new Date(now.getTime() - 1000 * 60 * 85).toISOString(),
                },
                log: {
                    heapUsageHistory: [
                        { time: '02:00', used: 320 },
                        { time: '02:10', used: 410 },
                        { time: '02:20', used: 480 },
                    ],
                },
                cratedAt: new Date(now.getTime() - 1000 * 60 * 85),
                updatedAt: new Date(now.getTime() - 1000 * 60 * 85),
            },
            {
                internalId: 'err-1053-fatal',
                message: 'FATAL: Desconexão com banco PostgreSQL primário - pool recriado com sucesso',
                level: LogLevel.FATAL,
                origem: 'SERVER_NESTJS',
                application: 'server/typeorm',
                status: LogStatus.RESOLVED,
                deveCorrigir: true,
                dispararAlerta: true,
                alertaDisparado: true,
                alertDetails: {
                    triggeredAt: new Date(now.getTime() - 1000 * 60 * 180).toISOString(),
                    reason: 'Conexão com PostgreSQL reiniciada automaticamente pelo ConnectionPoolManager.',
                    channels: ['DISCORD_WEBHOOK', 'SMS_ADMIN'],
                },
                metadata: {
                    host: 'postgres.ci.dev.br',
                    port: 5432,
                    reconnectAttempts: 2,
                    timestamp: new Date(now.getTime() - 1000 * 60 * 180).toISOString(),
                },
                log: {
                    error: 'ConnectionLostError: terminating connection due to administrator command',
                    stack: 'ConnectionLostError: terminating connection due to administrator command\n    at Connection.parseMessage (pg-protocol/dist/parser.js:287:14)\n    at Socket.<anonymous> (pg-protocol/dist/index.js:11:42)',
                },
                cratedAt: new Date(now.getTime() - 1000 * 60 * 180),
                updatedAt: new Date(now.getTime() - 1000 * 60 * 170),
            },
        ];
    }
}
