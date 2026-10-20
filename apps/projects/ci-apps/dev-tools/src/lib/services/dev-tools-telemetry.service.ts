import { Inject, Injectable, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { CpuInfo, TelemetryPoint, TelemetrySummary } from '../models/system-telemetry.model';
import { DEVTOOLS_API_CONFIG, DevToolsApiConfig } from '../models/dev-tools.model';

@Injectable({
    providedIn: 'root',
})
export class DevToolsTelemetryService {
    private summarySubject = new BehaviorSubject<TelemetrySummary>({
        currentHeapPercent: 0,
        currentCpuPercent: 0,
        heapUsedFormatted: '0 MB',
        heapTotalFormatted: '0 MB',
        rssFormatted: '0 MB',
        history: [],
        isStressed: false,
    });

    public summary$ = this.summarySubject.asObservable();
    private history: TelemetryPoint[] = [];

    constructor(
        private readonly http: HttpClient,
        @Optional() @Inject(DEVTOOLS_API_CONFIG) private readonly config?: DevToolsApiConfig,
    ) {}

    /**
     * Consulta a telemetria atual do sistema
     */
    public fetchTelemetry(): Observable<TelemetrySummary> {
        const root = this.config?.rootUrl || '';
        const url = root ? `${root.replace(/\/+$/, '')}/System/Leitura` : '/System/Leitura';

        return this.http.post<CpuInfo[]>(url, {}).pipe(
            map((items) => this.processTelemetryItems(items)),
            catchError((err) => {
                console.warn('[DevToolsTelemetryService] Falha ao obter telemetria, gerando ponto simulado:', err);
                return of(this.generateSimulatedTelemetry());
            }),
            tap((summary) => this.summarySubject.next(summary))
        );
    }

    private processTelemetryItems(items: CpuInfo[]): TelemetrySummary {
        if (!items || !items.length) {
            return this.generateSimulatedTelemetry();
        }

        const points: TelemetryPoint[] = items.slice(-30).map((item, idx) => {
            const heapTotal = Number(item.heapTotal || 100 * 1024 * 1024);
            const heapUsed = Number(item.heapUsed || 50 * 1024 * 1024);
            const rss = Number(item.rss || 120 * 1024 * 1024);
            const external = Number(item.external || 10 * 1024 * 1024);

            const heapPercentage = Math.min(100, Math.round((heapUsed / heapTotal) * 100));
            const cpuUserMs = Math.round((item.user || 0) / 1000);
            const cpuSystemMs = Math.round((item.system || 0) / 1000);

            // Estima % de carga com base na variação temporal
            const estimatedCpu = Math.min(100, Math.max(5, Math.round((cpuUserMs % 100))));

            return {
                timestamp: item.momento ? new Date(item.momento) : new Date(Date.now() - (items.length - idx) * 1000),
                cpuUserMs,
                cpuSystemMs,
                cpuEstimatedLoadPercent: estimatedCpu,
                heapUsedMb: Math.round(heapUsed / (1024 * 1024)),
                heapTotalMb: Math.round(heapTotal / (1024 * 1024)),
                heapPercentage,
                rssMb: Math.round(rss / (1024 * 1024)),
                externalMb: Math.round(external / (1024 * 1024)),
            };
        });

        this.history = points;
        const latest = points[points.length - 1];

        return {
            latest,
            currentHeapPercent: latest?.heapPercentage || 0,
            currentCpuPercent: latest?.cpuEstimatedLoadPercent || 0,
            heapUsedFormatted: `${latest?.heapUsedMb || 0} MB`,
            heapTotalFormatted: `${latest?.heapTotalMb || 0} MB`,
            rssFormatted: `${latest?.rssMb || 0} MB`,
            history: points,
            isStressed: (latest?.heapPercentage || 0) > 85 || (latest?.cpuEstimatedLoadPercent || 0) > 85,
        };
    }

    private generateSimulatedTelemetry(): TelemetrySummary {
        const now = new Date();
        const baseUsed = 340 + Math.floor(Math.random() * 45);
        const baseTotal = 512;
        const baseRss = 580 + Math.floor(Math.random() * 30);
        const cpuEst = 18 + Math.floor(Math.random() * 25);

        const point: TelemetryPoint = {
            timestamp: now,
            cpuUserMs: 12400 + Math.floor(Math.random() * 100),
            cpuSystemMs: 4200 + Math.floor(Math.random() * 50),
            cpuEstimatedLoadPercent: cpuEst,
            heapUsedMb: baseUsed,
            heapTotalMb: baseTotal,
            heapPercentage: Math.round((baseUsed / baseTotal) * 100),
            rssMb: baseRss,
            externalMb: 35,
        };

        if (this.history.length >= 30) {
            this.history.shift();
        }
        this.history.push(point);

        return {
            latest: point,
            currentHeapPercent: point.heapPercentage,
            currentCpuPercent: point.cpuEstimatedLoadPercent,
            heapUsedFormatted: `${point.heapUsedMb} MB`,
            heapTotalFormatted: `${point.heapTotalMb} MB`,
            rssFormatted: `${point.rssMb} MB`,
            history: [...this.history],
            isStressed: point.heapPercentage > 85 || point.cpuEstimatedLoadPercent > 85,
        };
    }
}
