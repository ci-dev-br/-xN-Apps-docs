import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { LogLevel, LogStatus, QueryLogDto, SystemLog, UpdateLogStateDto } from '../../models/log.model';
import { DevToolsLoggerService } from '../../services/dev-tools-logger.service';
import { DevToolsService } from '../../dev-tools.service';

@Component({
    selector: 'ci-log-viewer',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatIconModule,
        MatButtonModule,
        MatChipsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatTooltipModule,
        MatCheckboxModule,
        MatBadgeModule,
        MatMenuModule,
    ],
    templateUrl: './log-viewer.component.html',
    styleUrls: ['./log-viewer.component.scss'],
})
export class LogViewerComponent implements OnInit, OnDestroy {
    @Input() autoRefresh: boolean = true;
    @Output() inspectLog = new EventEmitter<SystemLog>();

    public logs: SystemLog[] = [];
    public totalLogs: number = 0;
    public isLoading: boolean = false;
    public selectedLog: SystemLog | null = null;

    // Filtros
    public search: string = '';
    public selectedLevel: string = 'ALL';
    public selectedOrigem: string = 'ALL';
    public selectedStatus: string = 'ALL';
    public filterDeveCorrigir: boolean = false;
    public filterAlerta: boolean = false;

    public readonly logLevels = [
        { label: 'Todos Níveis', value: 'ALL' },
        { label: 'Error', value: LogLevel.ERROR },
        { label: 'Fatal', value: LogLevel.FATAL },
        { label: 'Warn', value: LogLevel.WARN },
        { label: 'Info', value: LogLevel.INFO },
        { label: 'Debug', value: LogLevel.DEBUG },
        { label: 'Trace', value: LogLevel.TRACE },
    ];

    public readonly logStatuses = [
        { label: 'Todos Status', value: 'ALL' },
        { label: 'Novo', value: LogStatus.NEW },
        { label: 'Em Análise', value: LogStatus.IN_PROGRESS },
        { label: 'Pendente', value: LogStatus.PENDING },
        { label: 'Corrigido', value: LogStatus.RESOLVED },
        { label: 'Ignorado', value: LogStatus.IGNORED },
    ];

    public readonly origens = [
        { label: 'Todas Origens', value: 'ALL' },
        { label: 'Servidor', value: 'SERVER' },
        { label: 'Cliente', value: 'CLIENT' },
    ];

    private searchSubject = new Subject<string>();
    private subs = new Subscription();

    constructor(
        public readonly loggerService: DevToolsLoggerService,
        public readonly devToolsService: DevToolsService,
    ) {}

    ngOnInit(): void {
        this.subs.add(
            this.searchSubject.pipe(
                debounceTime(300),
                distinctUntilChanged()
            ).subscribe(() => this.loadLogs())
        );

        this.subs.add(
            this.devToolsService.refreshTrigger$.subscribe(() => {
                this.loadLogs();
            })
        );

        this.loadLogs();
    }

    ngOnDestroy(): void {
        this.subs.unsubscribe();
    }

    public onSearchChange(term: string): void {
        this.searchSubject.next(term);
    }

    public setLevelFilter(lvl: string): void {
        this.selectedLevel = lvl;
        this.loadLogs();
    }

    public loadLogs(): void {
        this.isLoading = true;
        const query: QueryLogDto = {
            limit: 100,
            offset: 0,
            search: this.search || undefined,
            level: this.selectedLevel !== 'ALL' ? this.selectedLevel : undefined,
            origem: this.selectedOrigem !== 'ALL' ? this.selectedOrigem : undefined,
            status: this.selectedStatus !== 'ALL' ? this.selectedStatus : undefined,
            deveCorrigir: this.filterDeveCorrigir ? true : undefined,
            dispararAlerta: this.filterAlerta ? true : undefined,
        };

        this.loggerService.query(query).subscribe({
            next: (res) => {
                this.logs = res.items || [];
                this.totalLogs = res.total || this.logs.length;
                this.isLoading = false;
                const stats = this.loggerService.computeSummaryStats(this.logs);
                this.devToolsService.updateStats(stats);
            },
            error: () => {
                this.isLoading = false;
            },
        });
    }

    public selectLogForDetail(log: SystemLog): void {
        this.selectedLog = log;
        this.devToolsService.selectLog(log);
        this.inspectLog.emit(log);
    }

    public closeDetail(): void {
        this.selectedLog = null;
        this.devToolsService.selectLog(null);
    }

    public toggleDeveCorrigir(log: SystemLog, event?: Event): void {
        if (event) event.stopPropagation();
        const newVal = !log.deveCorrigir;
        const dto: UpdateLogStateDto = {
            internalId: log.internalId,
            deveCorrigir: newVal,
        };
        this.loggerService.updateState(dto).subscribe((updated) => {
            log.deveCorrigir = updated.deveCorrigir;
            this.devToolsService.updateStats(this.loggerService.computeSummaryStats(this.logs));
        });
    }

    public changeStatus(log: SystemLog, status: LogStatus, event?: Event): void {
        if (event) event.stopPropagation();
        const dto: UpdateLogStateDto = {
            internalId: log.internalId,
            status,
        };
        this.loggerService.updateState(dto).subscribe((updated) => {
            log.status = updated.status;
            this.devToolsService.updateStats(this.loggerService.computeSummaryStats(this.logs));
        });
    }

    public triggerManualAlert(log: SystemLog, event?: Event): void {
        if (event) event.stopPropagation();
        this.loggerService.triggerAlert({
            internalId: log.internalId,
            reason: 'Alerta disparado pelo operador no painel DevTools',
            channels: ['DEVTOOLS_CONSOLE', 'MASTER_EMAIL'],
        }).subscribe((updated) => {
            log.dispararAlerta = true;
            log.alertaDisparado = true;
            log.alertDetails = updated.alertDetails;
            this.devToolsService.updateStats(this.loggerService.computeSummaryStats(this.logs));
        });
    }

    public copyToClipboard(text: string, event?: Event): void {
        if (event) event.stopPropagation();
        if (!text) return;
        navigator.clipboard.writeText(text);
    }

    public copyLogPayload(log: SystemLog, event?: Event): void {
        if (event) event.stopPropagation();
        if (!log || !log.log) return;
        const text = typeof log.log === 'string'
            ? log.log
            : (log.log?.stack || JSON.stringify(log.log, null, 2));
        this.copyToClipboard(text);
    }

    public exportCurrentLogs(): void {
        this.devToolsService.exportLogsAsJson(this.logs);
    }

    public getSeverityClass(level?: string): string {
        const l = String(level || '').toLowerCase();
        if (l === 'error' || l === 'fatal') return 'severity-error';
        if (l === 'warn') return 'severity-warn';
        if (l === 'info') return 'severity-info';
        if (l === 'debug') return 'severity-debug';
        if (l === 'trace') return 'severity-trace';
        return 'severity-info';
    }

    public getStatusBadgeClass(status?: string): string {
        switch (status) {
            case LogStatus.NEW:
                return 'status-new';
            case LogStatus.IN_PROGRESS:
                return 'status-in-progress';
            case LogStatus.RESOLVED:
                return 'status-resolved';
            case LogStatus.IGNORED:
                return 'status-ignored';
            default:
                return 'status-pending';
        }
    }
}
