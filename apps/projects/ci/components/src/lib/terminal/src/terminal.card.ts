import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, Optional, SimpleChanges, ViewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSelectModule } from "@angular/material/select";
import { MatTooltipModule } from "@angular/material/tooltip";
import { UserAuthenticationService } from "@ci/auth";
import { FileExplorerService, FilePermissionItem, ReadDirectoryOutput, User } from "@ci/portal-api";
import { lastValueFrom, Subscription } from "rxjs";
import { TerminalComponent } from "./terminal";

@Component({
    selector: 'ci-terminal-card',
    template: `
    <div class="terminal-card-shell">
        <div class="terminal-card-toolbar">
            <div class="toolbar-left">
                <span class="role-badge" [class.granted]="isSysAdmin" [class.denied]="!isSysAdmin">
                    <mat-icon>admin_panel_settings</mat-icon>
                    <span>SYSADMIN</span>
                </span>

                @if (isSysAdmin && authorizedPaths.length > 0) {
                    <select class="folder-select" [(ngModel)]="targetPathInput" (ngModelChange)="onAuthorizedFolderChange($event)"
                        [disabled]="loading" title="Selecionar pasta autorizada">
                        @for (p of authorizedPaths; track p) {
                            <option [value]="p">{{ p }}</option>
                        }
                        @if (targetPathInput && !authorizedPaths.includes(targetPathInput)) {
                            <option [value]="targetPathInput">{{ targetPathInput }} (solicitada)</option>
                        }
                    </select>
                } @else if (isSysAdmin) {
                    <span class="path-pill" [title]="targetPathInput">{{ targetPathInput || './' }}</span>
                }

                @if (isSysAdmin && isFolderAuthorized) {
                    <span class="status-pill authorized">
                        <mat-icon>verified_user</mat-icon>
                        <span>Pasta Autorizada</span>
                    </span>
                } @else if (isSysAdmin && !loading) {
                    <span class="status-pill pending">
                        <mat-icon>lock</mat-icon>
                        <span>Sem Permissão</span>
                    </span>
                }
            </div>

            <div class="toolbar-actions">
                @if (isSysAdmin) {
                    <button mat-icon-button class="toolbar-btn" (click)="verificarPermissaoEInicializar()" [disabled]="loading"
                        matTooltip="Verificar permissões e atualizar pasta autorizada">
                        <mat-icon>refresh</mat-icon>
                    </button>
                    @if (isFolderAuthorized) {
                        <button mat-icon-button class="toolbar-btn" (click)="alternarModoSolicitacao()"
                            matTooltip="Solicitar acesso a outra pasta">
                            <mat-icon>create_new_folder</mat-icon>
                        </button>
                        <button mat-icon-button class="toolbar-btn" (click)="limparTerminal()"
                            matTooltip="Limpar terminal">
                            <mat-icon>delete_sweep</mat-icon>
                        </button>
                    }
                }
            </div>
        </div>

        <div class="terminal-card-body">
            @if (!isAuthenticated) {
                <div class="guard-panel">
                    <mat-icon class="guard-icon warn">person_off</mat-icon>
                    <h4>Autenticação Necessária</h4>
                    <p>Faça login com um usuário que possua a role <code>SYSADMIN</code> para acessar o terminal.</p>
                </div>
            } @else if (!isSysAdmin) {
                <div class="guard-panel">
                    <mat-icon class="guard-icon error">gpp_bad</mat-icon>
                    <h4>Acesso Restrito (SYSADMIN)</h4>
                    <p>
                        O usuário <strong>{{ currentUserLabel }}</strong> não possui a role <code>SYSADMIN</code> necessária para operar este terminal.
                    </p>
                </div>
            } @else if (loading) {
                <div class="guard-panel">
                    <mat-spinner diameter="32"></mat-spinner>
                    <p>Validando permissão no File Explorer Service para <code>{{ targetPathInput || './' }}</code>...</p>
                </div>
            } @else if (!isFolderAuthorized || showRequestPanel) {
                <div class="permission-panel">
                    <div class="permission-header">
                        <mat-icon class="guard-icon lock">folder_off</mat-icon>
                        <div>
                            <h4>{{ isFolderAuthorized ? 'Solicitar Permissão para Outra Pasta' : 'Permissão de Pasta Necessária' }}</h4>
                            <p>
                                O File Explorer Service exige autorização explícita para acessar a pasta informada.
                                Uma solicitação enviará um e-mail com o link de autorização aos usuários <code>SYSADMIN</code>.
                            </p>
                        </div>
                    </div>

                    <div class="permission-form">
                        <label class="field-label">Caminho da Pasta</label>
                        <input type="text" class="dark-input" [(ngModel)]="requestPath" placeholder="Ex: ./ ou ../apps ou server/logs" />

                        <label class="field-label">Justificativa (opcional)</label>
                        <input type="text" class="dark-input" [(ngModel)]="requestReason" placeholder="Ex: Inspeção operacional pelo Terminal SYSADMIN" />

                        <div class="permission-actions">
                            <button mat-flat-button color="primary" (click)="solicitarPermissao()" [disabled]="requesting || !requestPath.trim()">
                                <mat-icon>mail</mat-icon>
                                {{ requesting ? 'Enviando solicitação...' : 'Solicitar Permissão por E-mail' }}
                            </button>
                            <button mat-stroked-button class="dark-stroked-btn" (click)="verificarPermissaoEInicializar()" [disabled]="loading">
                                <mat-icon>verified</mat-icon>
                                Verificar Acesso
                            </button>
                            @if (isFolderAuthorized && showRequestPanel) {
                                <button mat-button class="dark-text-btn" (click)="showRequestPanel = false">
                                    Voltar ao Terminal
                                </button>
                            }
                        </div>
                    </div>

                    @if (requestFeedback) {
                        <div class="feedback-banner" [class.error]="requestFeedbackIsError">
                            <mat-icon>{{ requestFeedbackIsError ? 'error_outline' : 'mark_email_read' }}</mat-icon>
                            <span>{{ requestFeedback }}</span>
                        </div>
                    }

                    @if (pendingRequests.length > 0) {
                        <div class="pending-list">
                            <span class="pending-title">Solicitações pendentes:</span>
                            @for (req of pendingRequests; track req.internalId || req.path || $index) {
                                <div class="pending-item">
                                    <mat-icon>schedule</mat-icon>
                                    <code>{{ req.path }}</code>
                                    <span class="pending-status">{{ req.status || 'PENDING' }}</span>
                                </div>
                            }
                        </div>
                    }
                </div>
            } @else {
                <ci-terminal
                    #terminal
                    (ready)="onTerminalReady()"
                    (userInput)="onTerminalInput($event)"
                    (resize)="onTerminalResize($event)">
                </ci-terminal>
            }
        </div>
    </div>
    `,
    styles: [`
        :host {
            display: block;
            width: 100%;
            height: 100%;
            min-height: 360px;
        }
        .terminal-card-shell {
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
            min-height: 360px;
            background: #14161a;
            color: #e2e8f0;
            border-radius: 10px;
            overflow: hidden;
            border: 1px solid #2a2f3a;
        }
        .terminal-card-toolbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            padding: 6px 10px;
            background: #1e222a;
            border-bottom: 1px solid #2a2f3a;
            flex-wrap: wrap;
        }
        .toolbar-left {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
            min-width: 0;
        }
        .toolbar-actions {
            display: flex;
            align-items: center;
            gap: 2px;
        }
        .toolbar-btn {
            color: #cbd5e1;
        }
        .role-badge, .status-pill, .path-pill {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 2px 8px;
            border-radius: 999px;
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0.03em;
            mat-icon {
                font-size: 14px;
                width: 14px;
                height: 14px;
            }
        }
        .role-badge.granted {
            background: rgba(59, 130, 246, 0.18);
            color: #93c5fd;
            border: 1px solid rgba(59, 130, 246, 0.35);
        }
        .role-badge.denied {
            background: rgba(239, 68, 68, 0.18);
            color: #fca5a5;
            border: 1px solid rgba(239, 68, 68, 0.35);
        }
        .status-pill.authorized {
            background: rgba(34, 197, 94, 0.16);
            color: #86efac;
            border: 1px solid rgba(34, 197, 94, 0.32);
        }
        .status-pill.pending {
            background: rgba(245, 158, 11, 0.16);
            color: #fcd34d;
            border: 1px solid rgba(245, 158, 11, 0.32);
        }
        .path-pill {
            background: #0f172a;
            color: #94a3b8;
            border: 1px solid #334155;
            font-family: monospace;
            max-width: 220px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .folder-select {
            background: #0f172a;
            color: #e2e8f0;
            border: 1px solid #334155;
            border-radius: 6px;
            padding: 3px 8px;
            font-size: 12px;
            font-family: monospace;
            max-width: 240px;
            outline: none;
        }
        .terminal-card-body {
            flex: 1;
            min-height: 300px;
            display: flex;
            flex-direction: column;
            position: relative;
            overflow: hidden;
        }
        ci-terminal {
            flex: 1;
            height: 100%;
            min-height: 300px;
        }
        .guard-panel, .permission-panel {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 20px;
            gap: 12px;
            overflow-y: auto;
        }
        .guard-panel {
            align-items: center;
            text-align: center;
            h4 { margin: 0; font-size: 1rem; color: #f8fafc; }
            p { margin: 0; font-size: 0.85rem; color: #94a3b8; max-width: 420px; }
        }
        .guard-icon {
            font-size: 36px;
            width: 36px;
            height: 36px;
            &.warn { color: #f59e0b; }
            &.error { color: #ef4444; }
            &.lock { color: #60a5fa; }
        }
        .permission-header {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            h4 { margin: 0 0 4px 0; font-size: 0.95rem; color: #f8fafc; }
            p { margin: 0; font-size: 0.8rem; color: #94a3b8; line-height: 1.4; }
        }
        .permission-form {
            display: flex;
            flex-direction: column;
            gap: 8px;
            background: #1b1f27;
            padding: 12px;
            border-radius: 8px;
            border: 1px solid #2d3340;
        }
        .field-label {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            color: #94a3b8;
        }
        .dark-input {
            background: #0f131a;
            color: #f1f5f9;
            border: 1px solid #334155;
            border-radius: 6px;
            padding: 8px 10px;
            font-size: 13px;
            font-family: monospace;
            outline: none;
            &:focus {
                border-color: #3b82f6;
            }
        }
        .permission-actions {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
            margin-top: 4px;
        }
        .dark-stroked-btn {
            color: #cbd5e1 !important;
            border-color: #475569 !important;
        }
        .dark-text-btn {
            color: #94a3b8 !important;
        }
        .feedback-banner {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 12px;
            border-radius: 8px;
            font-size: 12px;
            background: rgba(34, 197, 94, 0.14);
            border: 1px solid rgba(34, 197, 94, 0.35);
            color: #bbf7d0;
            &.error {
                background: rgba(239, 68, 68, 0.14);
                border-color: rgba(239, 68, 68, 0.35);
                color: #fecaca;
            }
        }
        .pending-list {
            display: flex;
            flex-direction: column;
            gap: 6px;
            font-size: 12px;
        }
        .pending-title {
            color: #94a3b8;
            font-weight: 600;
        }
        .pending-item {
            display: flex;
            align-items: center;
            gap: 8px;
            background: #1b1f27;
            padding: 6px 10px;
            border-radius: 6px;
            border: 1px solid #2d3340;
            mat-icon { font-size: 16px; width: 16px; height: 16px; color: #f59e0b; }
            .pending-status {
                margin-left: auto;
                font-size: 10px;
                padding: 2px 6px;
                border-radius: 999px;
                background: rgba(245, 158, 11, 0.16);
                color: #fcd34d;
            }
        }
        code {
            background: rgba(15, 23, 42, 0.8);
            padding: 1px 5px;
            border-radius: 4px;
            font-family: monospace;
            color: #93c5fd;
        }
    `],
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatProgressSpinnerModule,
        MatTooltipModule,
        TerminalComponent,
    ],
    standalone: true,
})
export class CardTerminalComponent implements OnInit, OnChanges, OnDestroy {
    @ViewChild('terminal') terminal?: TerminalComponent;

    @Input() authorizedPath?: string;
    @Input() path?: string;

    currentUser?: User;
    isAuthenticated = false;
    isSysAdmin = false;
    loading = false;
    requesting = false;
    isFolderAuthorized = false;
    showRequestPanel = false;

    authorizedPaths: string[] = [];
    pendingRequests: FilePermissionItem[] = [];

    targetPathInput = './';
    authorizedRoot = './';
    currentPath = './';
    requestPath = './';
    requestReason = '';
    requestFeedback?: string;
    requestFeedbackIsError = false;

    private userSub?: Subscription;
    private currentEntries: ReadDirectoryOutput[] = [];
    private lineBuffer = '';
    private commandHistory: string[] = [];
    private historyIndex = -1;
    private isExecuting = false;
    private bannerPrinted = false;

    constructor(
        @Optional() private readonly userAuth?: UserAuthenticationService,
        @Optional() private readonly fileExplorer?: FileExplorerService,
        @Optional() private readonly cdr?: ChangeDetectorRef,
    ) { }

    get currentUserLabel(): string {
        return this.currentUser?.fullName || this.currentUser?.username || this.currentUser?.email || 'Usuário';
    }

    ngOnInit(): void {
        if (this.authorizedPath || this.path) {
            const initial = (this.authorizedPath || this.path || './').trim();
            this.targetPathInput = initial;
            this.requestPath = initial;
        }

        if (this.userAuth?.user) {
            this.userSub = this.userAuth.user.subscribe(user => {
                this.applyUserState(user);
            });
        } else {
            this.applyUserState(undefined);
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if ((changes['authorizedPath'] || changes['path']) && !changes['authorizedPath']?.firstChange && !changes['path']?.firstChange) {
            const updated = (this.authorizedPath || this.path || './').trim();
            this.targetPathInput = updated;
            this.requestPath = updated;
            if (this.isSysAdmin) {
                this.verificarPermissaoEInicializar();
            }
        }
    }

    ngOnDestroy(): void {
        this.userSub?.unsubscribe();
    }

    private applyUserState(user?: User): void {
        this.currentUser = user;
        this.isAuthenticated = Boolean(user && user.id);
        this.isSysAdmin = Boolean(user?.roles && Array.isArray(user.roles) && user.roles.includes('SYSADMIN'));

        if (this.isSysAdmin) {
            this.verificarPermissaoEInicializar();
        } else {
            this.isFolderAuthorized = false;
            this.authorizedPaths = [];
            this.pendingRequests = [];
            this.cdr?.markForCheck();
        }
    }

    async onAuthorizedFolderChange(nextPath: string): Promise<void> {
        this.targetPathInput = nextPath;
        this.requestPath = nextPath;
        this.showRequestPanel = false;
        await this.verificarPermissaoEInicializar(nextPath);
    }

    async verificarPermissaoEInicializar(explicitPath?: string): Promise<void> {
        if (!this.isSysAdmin || !this.fileExplorer) {
            this.isFolderAuthorized = false;
            this.cdr?.markForCheck();
            return;
        }

        this.loading = true;
        this.bannerPrinted = false;
        this.cdr?.markForCheck();

        try {
            if (typeof this.fileExplorer.myPermissions === 'function') {
                const perms = await lastValueFrom(this.fileExplorer.myPermissions());
                this.authorizedPaths = perms?.authorizedPaths || [];
                this.pendingRequests = perms?.pendingRequests || [];
            }

            const preferredPath = (
                explicitPath ||
                this.authorizedPath ||
                this.path ||
                (this.authorizedPaths.includes(this.targetPathInput) ? this.targetPathInput : undefined) ||
                this.authorizedPaths[0] ||
                this.targetPathInput ||
                './'
            ).trim();

            this.targetPathInput = preferredPath;
            this.requestPath = preferredPath;

            const entries = await lastValueFrom(
                this.fileExplorer.readDirectory({ body: { path: preferredPath } })
            );

            if (Array.isArray(entries)) {
                this.isFolderAuthorized = true;
                this.showRequestPanel = false;
                this.authorizedRoot = this.normalizeFolderPath(preferredPath);
                this.currentPath = this.authorizedRoot;
                this.currentEntries = entries;
                if (!this.authorizedPaths.includes(preferredPath)) {
                    this.authorizedPaths = [preferredPath, ...this.authorizedPaths];
                }
            } else {
                this.isFolderAuthorized = false;
                this.currentEntries = [];
            }
        } catch {
            this.isFolderAuthorized = false;
            this.currentEntries = [];
        } finally {
            this.loading = false;
            this.cdr?.markForCheck();
            setTimeout(() => {
                if (this.isFolderAuthorized && this.terminal && !this.bannerPrinted) {
                    this.printBannerAndPrompt();
                }
            }, 50);
        }
    }

    async solicitarPermissao(): Promise<void> {
        if (!this.fileExplorer || typeof this.fileExplorer.requestPermission !== 'function') {
            this.requestFeedbackIsError = true;
            this.requestFeedback = 'Serviço de solicitação de permissão indisponível.';
            return;
        }

        const target = (this.requestPath || './').trim();
        this.requesting = true;
        this.requestFeedback = undefined;
        this.requestFeedbackIsError = false;
        this.cdr?.markForCheck();

        try {
            const res = await lastValueFrom(
                this.fileExplorer.requestPermission({
                    path: target,
                    reason: this.requestReason?.trim() || 'Solicitação via TerminalCard (SYSADMIN)',
                })
            );

            if (res?.alreadyAuthorized) {
                this.requestFeedback = res.message || `A pasta "${target}" já está autorizada.`;
                this.showRequestPanel = false;
                await this.verificarPermissaoEInicializar(target);
                return;
            }

            this.requestFeedback = res?.message || `Solicitação enviada aos usuários SYSADMIN para a pasta "${target}".`;
            this.requestFeedbackIsError = false;
            if (typeof this.fileExplorer.myPermissions === 'function') {
                const perms = await lastValueFrom(this.fileExplorer.myPermissions());
                this.pendingRequests = perms?.pendingRequests || [];
            }
        } catch (err: any) {
            this.requestFeedbackIsError = true;
            this.requestFeedback = err?.error?.message || err?.message || 'Não foi possível enviar a solicitação de permissão.';
        } finally {
            this.requesting = false;
            this.cdr?.markForCheck();
        }
    }

    alternarModoSolicitacao(): void {
        this.showRequestPanel = !this.showRequestPanel;
        if (this.showRequestPanel && !this.requestPath) {
            this.requestPath = this.authorizedRoot;
        }
    }

    limparTerminal(): void {
        this.terminal?.clear();
        this.writePrompt();
        this.terminal?.focus();
    }

    onTerminalReady(): void {
        if (this.isSysAdmin && this.isFolderAuthorized && !this.bannerPrinted) {
            this.printBannerAndPrompt();
        }
    }

    onTerminalResize(_size: { cols: number; rows: number }): void {
        // Resize handled by xterm FitAddon
    }

    private printBannerAndPrompt(): void {
        if (!this.terminal) return;
        this.bannerPrinted = true;
        this.terminal.clear();
        this.terminal.writeln('\x1b[1;36mCI Terminal [SYSADMIN]\x1b[0m — Escopo FileExplorer autorizado');
        this.terminal.writeln(`\x1b[90mUsuário:\x1b[0m ${this.currentUserLabel}  \x1b[90mPasta autorizada:\x1b[0m \x1b[32m${this.authorizedRoot}\x1b[0m`);
        this.terminal.writeln(`\x1b[90mDigite \x1b[33mhelp\x1b[90m para listar os comandos disponíveis.\x1b[0m`);
        this.writePrompt();
        this.terminal.focus();
    }

    private writePrompt(): void {
        if (!this.terminal) return;
        this.terminal.write(`\r\n\x1b[1;34msysadmin\x1b[0m:\x1b[1;32m${this.currentPath}\x1b[0m$ `);
    }

    async onTerminalInput(data: string): Promise<void> {
        if (!this.isSysAdmin || !this.isFolderAuthorized || this.isExecuting || !this.terminal) {
            return;
        }

        // Arrow Up / Down history
        if (data === '\x1b[A') {
            if (this.commandHistory.length > 0 && this.historyIndex < this.commandHistory.length - 1) {
                this.historyIndex++;
                this.replaceCurrentLine(this.commandHistory[this.commandHistory.length - 1 - this.historyIndex]);
            }
            return;
        }
        if (data === '\x1b[B') {
            if (this.historyIndex > 0) {
                this.historyIndex--;
                this.replaceCurrentLine(this.commandHistory[this.commandHistory.length - 1 - this.historyIndex]);
            } else if (this.historyIndex === 0) {
                this.historyIndex = -1;
                this.replaceCurrentLine('');
            }
            return;
        }

        // Ctrl+C
        if (data === '\x03') {
            this.lineBuffer = '';
            this.terminal.write('^C');
            this.writePrompt();
            return;
        }

        // Ctrl+L
        if (data === '\x0c') {
            this.limparTerminal();
            return;
        }

        // Tab autocomplete
        if (data === '\t') {
            this.handleTabAutocomplete();
            return;
        }

        // Enter
        if (data === '\r' || data === '\n') {
            const cmd = this.lineBuffer.trim();
            this.lineBuffer = '';
            this.historyIndex = -1;
            this.terminal.write('\r\n');
            if (cmd) {
                this.commandHistory.push(cmd);
                await this.executeCommand(cmd);
            }
            this.writePrompt();
            return;
        }

        // Backspace
        if (data === '\x7f' || data === '\b') {
            if (this.lineBuffer.length > 0) {
                this.lineBuffer = this.lineBuffer.slice(0, -1);
                this.terminal.write('\b \b');
            }
            return;
        }

        // Printable characters (handle pasted multi-char chunks too)
        const printable = data.replace(/[\x00-\x1f\x7f]/g, '');
        if (printable.length > 0) {
            this.lineBuffer += printable;
            this.terminal.write(printable);
        }
    }

    private replaceCurrentLine(newText: string): void {
        if (!this.terminal) return;
        const backspaces = '\b \b'.repeat(this.lineBuffer.length);
        this.lineBuffer = newText;
        this.terminal.write(backspaces + newText);
    }

    private handleTabAutocomplete(): void {
        if (!this.terminal) return;
        const parts = this.lineBuffer.split(/\s+/);
        const lastPart = parts[parts.length - 1] || '';
        const matches = this.currentEntries
            .map(e => e.name || '')
            .filter(name => name.toLowerCase().startsWith(lastPart.toLowerCase()));

        if (matches.length === 1) {
            const suffix = matches[0].slice(lastPart.length);
            this.lineBuffer += suffix;
            this.terminal.write(suffix);
        } else if (matches.length > 1) {
            this.terminal.writeln('');
            this.terminal.writeln(matches.join('  '));
            this.writePrompt();
            this.terminal.write(this.lineBuffer);
        }
    }

    private async executeCommand(rawLine: string): Promise<void> {
        if (!this.terminal || !this.fileExplorer) return;
        const tokens = rawLine.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
        const cleanTokens = tokens.map(t => t.replace(/^["']|["']$/g, ''));
        const cmd = (cleanTokens[0] || '').toLowerCase();
        const args = cleanTokens.slice(1);

        this.isExecuting = true;
        try {
            switch (cmd) {
                case 'help':
                case '?':
                    this.terminal.writeln('\x1b[1mComandos disponíveis (FileExplorerService):\x1b[0m');
                    this.terminal.writeln('  \x1b[33mhelp\x1b[0m               Exibe esta ajuda');
                    this.terminal.writeln('  \x1b[33mpwd\x1b[0m                Exibe o diretório atual na pasta autorizada');
                    this.terminal.writeln('  \x1b[33mls [pasta]\x1b[0m         Lista arquivos e pastas');
                    this.terminal.writeln('  \x1b[33mcd <pasta>\x1b[0m         Navega dentro da pasta autorizada');
                    this.terminal.writeln('  \x1b[33mcat <arquivo>\x1b[0m      Exibe o conteúdo de um arquivo');
                    this.terminal.writeln('  \x1b[33mtree [pasta]\x1b[0m       Exibe a árvore de diretórios');
                    this.terminal.writeln('  \x1b[33mgit status <arq>\x1b[0m   Consulta status git de um arquivo autorizado');
                    this.terminal.writeln('  \x1b[33mfolders\x1b[0m            Lista todas as pastas autorizadas para o usuário');
                    this.terminal.writeln('  \x1b[33mwhoami\x1b[0m             Exibe usuário, role e pasta autorizada');
                    this.terminal.writeln('  \x1b[33mclear\x1b[0m              Limpa o terminal');
                    break;

                case 'pwd':
                    this.terminal.writeln(this.currentPath);
                    break;

                case 'whoami':
                    this.terminal.writeln(`Usuário: ${this.currentUserLabel} (${this.currentUser?.email || 'sem e-mail'})`);
                    this.terminal.writeln(`Roles: ${(this.currentUser?.roles || []).join(', ')}`);
                    this.terminal.writeln(`Pasta autorizada: ${this.authorizedRoot}`);
                    break;

                case 'folders':
                case 'perms': {
                    if (typeof this.fileExplorer.myPermissions === 'function') {
                        const perms = await lastValueFrom(this.fileExplorer.myPermissions());
                        this.authorizedPaths = perms?.authorizedPaths || [];
                    }
                    if (this.authorizedPaths.length === 0) {
                        this.terminal.writeln('\x1b[33mNenhuma pasta autorizada encontrada.\x1b[0m');
                    } else {
                        for (const p of this.authorizedPaths) {
                            const marker = this.normalizeFolderPath(p) === this.authorizedRoot ? '\x1b[32m*\x1b[0m ' : '  ';
                            this.terminal.writeln(`${marker}${p}`);
                        }
                    }
                    break;
                }

                case 'clear':
                case 'cls':
                    this.terminal.clear();
                    break;

                case 'refresh':
                    await this.verificarPermissaoEInicializar(this.authorizedRoot);
                    break;

                case 'ls':
                case 'dir': {
                    const target = args[0] ? this.resolvePathWithinAuthorizedRoot(args[0]) : this.currentPath;
                    if (!target) {
                        this.terminal.writeln('\x1b[31mAcesso negado: caminho fora da pasta autorizada.\x1b[0m');
                        break;
                    }
                    const items = await lastValueFrom(this.fileExplorer.readDirectory({ body: { path: target } }));
                    if (!Array.isArray(items)) {
                        this.terminal.writeln(`\x1b[31mSem permissão ou diretório inexistente: ${target}\x1b[0m`);
                        break;
                    }
                    if (target === this.currentPath) {
                        this.currentEntries = items;
                    }
                    if (items.length === 0) {
                        this.terminal.writeln('\x1b[90m(diretório vazio)\x1b[0m');
                    } else {
                        const sorted = [...items].sort((a, b) => {
                            if (Boolean(a.isDirectory) !== Boolean(b.isDirectory)) {
                                return a.isDirectory ? -1 : 1;
                            }
                            return (a.name || '').localeCompare(b.name || '');
                        });
                        for (const item of sorted) {
                            if (item.isDirectory) {
                                this.terminal.writeln(`\x1b[1;36m${item.name}/\x1b[0m`);
                            } else {
                                this.terminal.writeln(`${item.name}`);
                            }
                        }
                    }
                    break;
                }

                case 'cd': {
                    const rawTarget = args[0] || this.authorizedRoot;
                    const resolved = this.resolvePathWithinAuthorizedRoot(rawTarget);
                    if (!resolved) {
                        this.terminal.writeln(`\x1b[31mAcesso negado: não é permitido sair da pasta autorizada (${this.authorizedRoot}).\x1b[0m`);
                        break;
                    }
                    const items = await lastValueFrom(this.fileExplorer.readDirectory({ body: { path: resolved } }));
                    if (!Array.isArray(items)) {
                        this.terminal.writeln(`\x1b[31mDiretório inacessível ou sem permissão: ${resolved}\x1b[0m`);
                        break;
                    }
                    this.currentPath = resolved;
                    this.currentEntries = items;
                    break;
                }

                case 'tree': {
                    const target = args[0] ? this.resolvePathWithinAuthorizedRoot(args[0]) : this.currentPath;
                    if (!target) {
                        this.terminal.writeln('\x1b[31mAcesso negado: caminho fora da pasta autorizada.\x1b[0m');
                        break;
                    }
                    const items = await lastValueFrom(this.fileExplorer.readDirectory({ body: { path: target } }));
                    if (!Array.isArray(items)) {
                        this.terminal.writeln(`\x1b[31mSem permissão ou diretório inexistente: ${target}\x1b[0m`);
                        break;
                    }
                    this.terminal.writeln(`\x1b[1;36m${target}\x1b[0m`);
                    this.printTree(items as any[], '');
                    break;
                }

                case 'cat':
                case 'type': {
                    if (!args[0]) {
                        this.terminal.writeln('\x1b[33mUso: cat <caminho-do-arquivo>\x1b[0m');
                        break;
                    }
                    const target = this.resolvePathWithinAuthorizedRoot(args[0]);
                    if (!target) {
                        this.terminal.writeln('\x1b[31mAcesso negado: arquivo fora da pasta autorizada.\x1b[0m');
                        break;
                    }
                    const res: any = await lastValueFrom(this.fileExplorer.readFile({ body: { path: target } }));
                    if (res?.status === 500 || res?.cause) {
                        this.terminal.writeln(`\x1b[31mErro ao ler arquivo: ${res?.cause?.message || 'Acesso negado ou arquivo inválido.'}\x1b[0m`);
                        break;
                    }
                    const content = typeof res?.data === 'string' ? res.data : JSON.stringify(res?.data ?? '', null, 2);
                    const lines = content.replace(/\r\n/g, '\n').split('\n');
                    for (const line of lines) {
                        this.terminal.writeln(line);
                    }
                    break;
                }

                case 'git': {
                    if (args[0] === 'status' && args[1]) {
                        const target = this.resolvePathWithinAuthorizedRoot(args[1]);
                        if (!target) {
                            this.terminal.writeln('\x1b[31mAcesso negado: arquivo fora da pasta autorizada.\x1b[0m');
                            break;
                        }
                        const res: any = await lastValueFrom(this.fileExplorer.readFile({ body: { path: target } }));
                        if (res?.gitStatus) {
                            this.terminal.writeln(JSON.stringify(res.gitStatus, null, 2).replace(/\n/g, '\r\n'));
                        } else {
                            this.terminal.writeln('\x1b[33mStatus git indisponível.\x1b[0m');
                        }
                    } else {
                        this.terminal.writeln('\x1b[33mUso: git status <arquivo>\x1b[0m');
                    }
                    break;
                }

                default:
                    this.terminal.writeln(`\x1b[31mComando não reconhecido: ${cmd}\x1b[0m (digite \x1b[33mhelp\x1b[0m)`);
                    break;
            }
        } catch (err: any) {
            this.terminal.writeln(`\x1b[31mErro: ${err?.message || 'Falha ao executar comando.'}\x1b[0m`);
        } finally {
            this.isExecuting = false;
        }
    }

    private printTree(items: Array<ReadDirectoryOutput & { children?: any[] }>, prefix: string): void {
        if (!this.terminal || !Array.isArray(items)) return;
        items.forEach((item, index) => {
            const isLast = index === items.length - 1;
            const connector = isLast ? '└── ' : '├── ';
            const label = item.isDirectory ? `\x1b[1;36m${item.name}/\x1b[0m` : `${item.name}`;
            this.terminal!.writeln(`${prefix}${connector}${label}`);
            if (item.isDirectory && Array.isArray(item.children) && item.children.length > 0) {
                this.printTree(item.children, prefix + (isLast ? '    ' : '│   '));
            }
        });
    }

    private normalizeFolderPath(raw: string): string {
        let clean = (raw || './').trim().replace(/\\/g, '/');
        if (clean === '.' || clean === './') return './';
        if (clean.length > 1 && clean.endsWith('/') && !clean.endsWith(':/')) {
            clean = clean.replace(/\/+$/, '');
        }
        return clean;
    }

    private toSegments(pathValue: string): { prefix: string; segments: string[] } {
        const clean = this.normalizeFolderPath(pathValue);
        if (clean === './') return { prefix: './', segments: [] };
        if (/^[a-zA-Z]:/.test(clean)) {
            const [drive, ...rest] = clean.split('/');
            return { prefix: `${drive}/`, segments: rest.filter(Boolean) };
        }
        if (clean.startsWith('/')) {
            return { prefix: '/', segments: clean.split('/').filter(Boolean) };
        }
        if (clean.startsWith('../')) {
            return { prefix: '../', segments: clean.slice(3).split('/').filter(Boolean) };
        }
        if (clean.startsWith('./')) {
            return { prefix: './', segments: clean.slice(2).split('/').filter(Boolean) };
        }
        return { prefix: './', segments: clean.split('/').filter(Boolean) };
    }

    private resolvePathWithinAuthorizedRoot(inputPath: string): string | null {
        const root = this.toSegments(this.authorizedRoot);
        const cur = this.toSegments(this.currentPath);
        const cleanInput = (inputPath || '').trim().replace(/\\/g, '/');

        let workingSegments: string[];
        let prefix = cur.prefix;

        if (!cleanInput || cleanInput === '.') {
            workingSegments = [...cur.segments];
        } else if (cleanInput.startsWith('/')) {
            if (root.prefix === '/') {
                workingSegments = cleanInput.split('/').filter(Boolean);
                prefix = '/';
            } else {
                workingSegments = [...root.segments, ...cleanInput.split('/').filter(Boolean)];
                prefix = root.prefix;
            }
        } else {
            workingSegments = [...cur.segments];
            for (const part of cleanInput.split('/')) {
                if (!part || part === '.') continue;
                if (part === '..') {
                    if (workingSegments.length <= root.segments.length) {
                        return null;
                    }
                    workingSegments.pop();
                } else {
                    workingSegments.push(part);
                }
            }
        }

        if (prefix !== root.prefix || workingSegments.length < root.segments.length) {
            return null;
        }
        for (let i = 0; i < root.segments.length; i++) {
            if (workingSegments[i] !== root.segments[i]) {
                return null;
            }
        }

        if (workingSegments.length === 0) {
            return prefix;
        }
        return prefix.endsWith('/')
            ? `${prefix}${workingSegments.join('/')}`
            : `${prefix}/${workingSegments.join('/')}`;
    }
}

export const TerminalCardInfo = {
    title: 'Terminal',
    descricao: `Componente de terminal interativo baseado em xterm.js para usuários SYSADMIN, integrado ao FileExplorerService com validação de permissão para a pasta autorizada.`,
    tags: ['Terminal', 'CLI', 'Console', 'SYSADMIN'],
    roles: ['SYSADMIN'],
    componentRef: CardTerminalComponent,
    componentVersion: '1.0.0',
    componentName: 'TerminalCard',
    settings: {
        authorizedPath: { label: 'Pasta Autorizada' }
    }
};
