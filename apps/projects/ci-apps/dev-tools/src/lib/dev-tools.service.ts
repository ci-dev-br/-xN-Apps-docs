import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { DevToolTab, DevToolModuleInfo } from './models/dev-tools.model';
import { LogSummaryStats, SystemLog } from './models/log.model';

@Injectable({
    providedIn: 'root',
})
export class DevToolsService {
    private activeTabSubject = new BehaviorSubject<DevToolTab>('logs');
    public activeTab$ = this.activeTabSubject.asObservable();

    private autoRefreshSubject = new BehaviorSubject<boolean>(true);
    public autoRefresh$ = this.autoRefreshSubject.asObservable();

    private refreshTriggerSubject = new Subject<void>();
    public refreshTrigger$ = this.refreshTriggerSubject.asObservable();

    private statsSubject = new BehaviorSubject<LogSummaryStats>({
        total: 0,
        errors: 0,
        warns: 0,
        toFix: 0,
        resolved: 0,
        alertsTriggered: 0,
    });
    public stats$ = this.statsSubject.asObservable();

    private selectedLogSubject = new BehaviorSubject<SystemLog | null>(null);
    public selectedLog$ = this.selectedLogSubject.asObservable();

    public readonly availableModules: DevToolModuleInfo[] = [
        {
            id: 'logs',
            name: 'Logs de Erros do Sistema',
            category: 'Diagnóstico & Resiliência',
            version: '2.1.0',
            description: 'Monitoramento, catalogação, filtragem e tratamento de erros do servidor e cliente.',
            status: 'active',
            icon: 'bug_report',
        },
        {
            id: 'telemetry',
            name: 'Telemetria & Recursos',
            category: 'Performance',
            version: '1.4.0',
            description: 'Consumo de CPU, memória Heap, RSS e telemetria operacional em tempo real.',
            status: 'stable',
            icon: 'speed',
        },
        {
            id: 'disk-logs',
            name: 'Arquivos de Log em Disco',
            category: 'Infraestrutura',
            version: '1.2.0',
            description: 'Explorador e visualizador de arquivos de log e traces físicos do servidor.',
            status: 'active',
            icon: 'folder_open',
        },
        {
            id: 'environment',
            name: 'Ambiente & Módulos',
            category: 'Configuração',
            version: '1.0.0',
            description: 'Diagnóstico de versão, branch, commits e integridade dos módulos carregados.',
            status: 'stable',
            icon: 'settings_suggest',
        },
        {
            id: 'simulator',
            name: 'Simulador de Logs',
            category: 'Desenvolvimento & Testes',
            version: '1.1.0',
            description: 'Injeção de logs de teste para validação de esteira de erros e alertas.',
            status: 'beta',
            icon: 'science',
        },
    ];

    constructor() {}

    public setActiveTab(tab: DevToolTab): void {
        this.activeTabSubject.next(tab);
    }

    public setAutoRefresh(enabled: boolean): void {
        this.autoRefreshSubject.next(enabled);
    }

    public triggerRefresh(): void {
        this.refreshTriggerSubject.next();
    }

    public updateStats(stats: LogSummaryStats): void {
        this.statsSubject.next(stats);
    }

    public selectLog(log: SystemLog | null): void {
        this.selectedLogSubject.next(log);
    }

    /**
     * Exporta logs como arquivo JSON
     */
    public exportLogsAsJson(logs: SystemLog[], filename: string = 'system-logs-export.json'): void {
        const json = JSON.stringify(logs, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }
}
