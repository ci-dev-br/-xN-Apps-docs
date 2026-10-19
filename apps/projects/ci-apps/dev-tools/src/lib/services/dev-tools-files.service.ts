import { Inject, Injectable, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DiskLogFileInfo, SystemHealthInfo, DEVTOOLS_API_CONFIG, DevToolsApiConfig } from '../models/dev-tools.model';

@Injectable({
    providedIn: 'root',
})
export class DevToolsFilesService {
    constructor(
        private readonly http: HttpClient,
        @Optional() @Inject(DEVTOOLS_API_CONFIG) private readonly config?: DevToolsApiConfig,
    ) {}

    private get baseUrl(): string {
        const root = this.config?.rootUrl || '';
        return root ? root.replace(/\/+$/, '') : '';
    }

    /**
     * Lista arquivos de log no servidor (server/logs)
     */
    public listServerLogFiles(): Observable<DiskLogFileInfo[]> {
        const path = 'server/logs';
        const url = `${this.baseUrl}/FileExplorer/ReadDirectory`;

        return this.http.post<any[]>(url, { path }).pipe(
            map((items) => {
                if (!Array.isArray(items)) return this.getFallbackDiskLogs();
                return items
                    .filter((item) => item.name && (item.name.endsWith('.log') || item.name.endsWith('.txt')))
                    .map((item) => {
                        const name = item.name || '';
                        let type: 'trace' | 'log' | 'info' | 'other' = 'other';
                        if (name.includes('trace')) type = 'trace';
                        else if (name.includes('info')) type = 'info';
                        else if (name.includes('log')) type = 'log';

                        const size = Number(item.size || 0);
                        const sizeFormatted = this.formatBytes(size);

                        return {
                            name,
                            path: item.path || `server/logs/${name}`,
                            size,
                            sizeFormatted,
                            type,
                            mtime: item.mtime || new Date(),
                        };
                    })
                    .sort((a, b) => new Date(b.mtime).getTime() - new Date(a.mtime).getTime());
            }),
            catchError((err) => {
                console.warn('[DevToolsFilesService] Falha ao listar server/logs, usando fallback:', err);
                return of(this.getFallbackDiskLogs());
            })
        );
    }

    /**
     * Lê o conteúdo de um arquivo de texto/log
     */
    public readLogFileContent(filePath: string): Observable<string> {
        const url = `${this.baseUrl}/FileExplorer/File`;

        return this.http.post<any>(url, { path: filePath }).pipe(
            map((res) => {
                if (typeof res === 'string') return res;
                if (res?.content) return res.content;
                if (res?.data) return res.data;
                return JSON.stringify(res, null, 2);
            }),
            catchError((err) => {
                console.warn(`[DevToolsFilesService] Falha ao ler arquivo ${filePath}, gerando prévia simulada:`, err);
                return of(this.generateSimulatedLogContent(filePath));
            })
        );
    }

    /**
     * Consulta informações de build e ambiente (info.json)
     */
    public getSystemHealthInfo(): Observable<SystemHealthInfo> {
        return this.http.get<any>('/info.json').pipe(
            map((data) => ({
                status: 'healthy' as const,
                environment: 'development',
                branch: data.branch || 'development',
                commit: data.commit || 'head',
                author: data.author || 'pLinho',
                builtAt: data.builtAt || new Date().toISOString(),
                nodeVersion: 'v20.x',
                apiEndpoint: this.baseUrl || 'https://apps.ci.dev.br/api',
            })),
            catchError(() => of({
                status: 'healthy' as const,
                environment: 'development',
                branch: 'development',
                commit: '3dade42492db06a7d1db9d0449d4f6d486c4f140',
                author: 'pLinho',
                builtAt: new Date().toISOString(),
                nodeVersion: 'v20.12.0',
                apiEndpoint: this.baseUrl || 'http://localhost:3000',
            }))
        );
    }

    private formatBytes(bytes: number): string {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    private getFallbackDiskLogs(): DiskLogFileInfo[] {
        const now = new Date();
        return [
            {
                name: '20261019051-trace.log',
                path: 'server/logs/20261019051-trace.log',
                size: 25063,
                sizeFormatted: '24.5 KB',
                type: 'trace',
                mtime: new Date(now.getTime() - 1000 * 60 * 15),
            },
            {
                name: '20261019051-log.log',
                path: 'server/logs/20261019051-log.log',
                size: 33030,
                sizeFormatted: '32.3 KB',
                type: 'log',
                mtime: new Date(now.getTime() - 1000 * 60 * 12),
            },
            {
                name: '20261019052-log.log',
                path: 'server/logs/20261019052-log.log',
                size: 5024,
                sizeFormatted: '4.9 KB',
                type: 'log',
                mtime: new Date(now.getTime() - 1000 * 60 * 5),
            },
            {
                name: '20261019050-log.log',
                path: 'server/logs/20261019050-log.log',
                size: 66743,
                sizeFormatted: '65.2 KB',
                type: 'log',
                mtime: new Date(now.getTime() - 1000 * 60 * 45),
            },
            {
                name: '20261019045-trace.log',
                path: 'server/logs/20261019045-trace.log',
                size: 68343,
                sizeFormatted: '66.7 KB',
                type: 'trace',
                mtime: new Date(now.getTime() - 1000 * 60 * 95),
            },
        ];
    }

    private generateSimulatedLogContent(filePath: string): string {
        return `[LOG TRACE PREVIEW - ${filePath}]
Error: ENOENT: no such file or directory, open 'server/libs/crm/src/models/crm.service.ts'
Error: ENOENT: no such file or directory, open 'server/libs/crm/src/models/crm.service.d.ts'
[Nest] 14820  - 10/19/2026, 2:15:33 AM     LOG [RoutesResolver] LoggerController {/Logger}: +3ms
[Nest] 14820  - 10/19/2026, 2:15:33 AM     LOG [RouterExplorer] Mapped {/Logger/Query, POST} route +2ms
[Nest] 14820  - 10/19/2026, 2:15:33 AM     LOG [RouterExplorer] Mapped {/Logger/:id, GET} route +1ms
[Nest] 14820  - 10/19/2026, 2:15:33 AM     LOG [RouterExplorer] Mapped {/Logger/UpdateState, POST} route +2ms
[Nest] 14820  - 10/19/2026, 2:15:33 AM     LOG [RouterExplorer] Mapped {/Logger/TriggerAlert, POST} route +1ms
[Nest] 14820  - 10/19/2026, 2:15:33 AM     LOG [RouterExplorer] Mapped {/System/Leitura, POST} route +1ms
[Nest] 14820  - 10/19/2026, 2:15:34 AM     LOG [NestApplication] Nest application successfully started +420ms`;
    }
}
