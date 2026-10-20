import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CreateLogDto, LogLevel, LogStatus } from '../../models/log.model';
import { DevToolsLoggerService } from '../../services/dev-tools-logger.service';

@Component({
    selector: 'ci-log-simulator',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatIconModule,
        MatButtonModule,
        MatCheckboxModule,
    ],
    templateUrl: './log-simulator.component.html',
    styleUrls: ['./log-simulator.component.scss'],
})
export class LogSimulatorComponent {
    @Output() logSimulated = new EventEmitter<void>();

    public form: CreateLogDto = {
        message: 'Falha simulada de teste no pipeline de desenvolvimento',
        level: LogLevel.ERROR,
        origem: 'SERVER',
        application: '@ci-apps/dev-tools',
        status: LogStatus.NEW,
        deveCorrigir: true,
        dispararAlerta: false,
        log: {
            error: 'TestException: Operação falhou no simulador',
            timestamp: new Date().toISOString(),
            context: 'Simulação interativa de erro para validação da esteira de logs',
        },
    };

    public isSending: boolean = false;
    public successMessage: string = '';

    public readonly presets = [
        {
            title: 'Erro de Banco (QueryFailedError)',
            level: LogLevel.ERROR,
            origem: 'SERVER',
            app: 'server/typeorm',
            msg: 'QueryFailedError: relation "ci_logs" does not exist at character 15',
            deveCorrigir: true,
            dispararAlerta: true,
            stack: 'QueryFailedError: relation "ci_logs" does not exist\n    at PostgresQueryRunner.query (src/driver/postgres/PostgresQueryRunner.ts:241:19)',
        },
        {
            title: 'Exceção HTTP 404 (NotFoundException)',
            level: LogLevel.WARN,
            origem: 'SERVER',
            app: '@ci/portal-api',
            msg: 'NotFoundException: Recurso de aplicação não encontrado para o tenant ativo',
            deveCorrigir: false,
            dispararAlerta: false,
            stack: 'NotFoundException: Recurso de aplicação não encontrado\n    at AppService.getTenantResource (app.service.ts:88:13)',
        },
        {
            title: 'Erro de Frontend (NullReference / TypeError)',
            level: LogLevel.ERROR,
            origem: 'CLIENT',
            app: '@ci-apps/Codex',
            msg: "TypeError: Cannot read properties of undefined (reading 'split')",
            deveCorrigir: true,
            dispararAlerta: false,
            stack: "TypeError: Cannot read properties of undefined (reading 'split')\n    at CodeEditorComponent.formatFile (code-editor.component.ts:182:24)",
        },
        {
            title: 'Falha Crítica do Sistema (FATAL)',
            level: LogLevel.FATAL,
            origem: 'SERVER',
            app: 'server/core',
            msg: 'FATAL: Daemon process crashed unexpectedly - SIGKILL received',
            deveCorrigir: true,
            dispararAlerta: true,
            stack: 'ProcessCrashError: Daemon process crashed unexpectedly\n    at ChildProcessWorker.onExit (daemon.service.ts:312:11)',
        },
    ];

    constructor(private readonly loggerService: DevToolsLoggerService) {}

    public applyPreset(p: typeof this.presets[0]): void {
        this.form.message = p.msg;
        this.form.level = p.level;
        this.form.origem = p.origem;
        this.form.application = p.app;
        this.form.deveCorrigir = p.deveCorrigir;
        this.form.dispararAlerta = p.dispararAlerta;
        this.form.log = {
            error: p.msg,
            stack: p.stack,
            timestamp: new Date().toISOString(),
        };
        this.successMessage = '';
    }

    public submitSimulation(): void {
        this.isSending = true;
        this.successMessage = '';

        this.loggerService.registerLog(this.form).subscribe({
            next: (created) => {
                this.isSending = false;
                this.successMessage = `Log simulado com sucesso! ID gerado: ${created.internalId}`;
                this.logSimulated.emit();
            },
            error: () => {
                this.isSending = false;
            },
        });
    }
}
