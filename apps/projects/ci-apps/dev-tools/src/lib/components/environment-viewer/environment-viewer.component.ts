import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DevToolModuleInfo, SystemHealthInfo } from '../../models/dev-tools.model';
import { DevToolsFilesService } from '../../services/dev-tools-files.service';
import { DevToolsService } from '../../dev-tools.service';

@Component({
    selector: 'ci-environment-viewer',
    standalone: true,
    imports: [
        CommonModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
    ],
    templateUrl: './environment-viewer.component.html',
    styleUrls: ['./environment-viewer.component.scss'],
})
export class EnvironmentViewerComponent implements OnInit {
    public healthInfo: SystemHealthInfo = {
        status: 'healthy',
        environment: 'development',
        branch: 'development',
        commit: '3dade42492db06a7d1db9d0449d4f6d486c4f140',
        author: 'pLinho',
        builtAt: new Date().toISOString(),
        nodeVersion: 'v20.x',
        apiEndpoint: 'https://apps.ci.dev.br/api',
    };

    public modules: DevToolModuleInfo[] = [];

    public readonly systemCapabilities = [
        { name: 'NestJS Backend API', status: 'Online', desc: 'Controladores REST & WebSockets ativos em server/src', icon: 'dns', ok: true },
        { name: 'PostgreSQL Database & TypeORM', status: 'Conectado', desc: 'Entidades de Log, Auditoria e Negócio catalogadas', icon: 'storage', ok: true },
        { name: 'Pipeline de Logs & LoggerController', status: 'Ativo', desc: 'Rotas /Logger/Query, /Logger/Register e /Logger/UpdateState', icon: 'pest_control', ok: true },
        { name: 'Monitoramento de Recursos (CPU / Heap)', status: 'Ativo', desc: 'Process.cpuUsage() e memoryUsage() via /System/Leitura', icon: 'speed', ok: true },
        { name: 'File Explorer Server Engine', status: 'Ativo', desc: 'Exploração segura de diretórios e logs físicos em disco', icon: 'folder', ok: true },
        { name: 'DevTools Suite (@ci-apps/dev-tools)', status: 'Pronto', desc: 'Interface de instrumentação e diagnóstico completo', icon: 'terminal', ok: true },
    ];

    constructor(
        private readonly filesService: DevToolsFilesService,
        private readonly devToolsService: DevToolsService,
    ) {
        this.modules = this.devToolsService.availableModules;
    }

    ngOnInit(): void {
        this.filesService.getSystemHealthInfo().subscribe((info) => {
            this.healthInfo = info;
        });
    }

    public copyCommitSha(): void {
        navigator.clipboard.writeText(this.healthInfo.commit);
    }
}
