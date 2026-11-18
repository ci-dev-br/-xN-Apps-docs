import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, Optional, Type } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Apps } from '@ci/core';
import { Block, BlockService, BlockSnapshotDto } from '@ci/portal-api';
import { lastValueFrom } from 'rxjs';
import { DynamicBlockSpecification } from '../blocks-builder/blocks-builder.models';

export interface BlockHistoryDialogData {
    block: Block;
    currentSpec?: DynamicBlockSpecification;
}

/**
 * Dialog de Histórico de Versões (Snapshots) de um Block.
 * Descobre e injeta indiretamente o CodeX (`CodeEditorComponent`) via metadados
 * de rota (`data.manifest`) usando o serviço `Apps` (`@ci/core`) quando disponível.
 */
@Component({
    selector: 'ci-block-history-dialog',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
    ],
    template: `
        <h2 mat-dialog-title class="history-title">
            <mat-icon>history</mat-icon>
            <span>Histórico de Versões — {{ data.block.name || 'Tela' }}</span>
            <span class="codex-badge" *ngIf="codexComponent">CodeX Ativo</span>
        </h2>

        <mat-dialog-content class="history-content">
            <div class="history-layout">
                <aside class="snapshots-list">
                    <div class="loading-box" *ngIf="loading">
                        <mat-spinner diameter="28"></mat-spinner>
                        <span>Carregando snapshots...</span>
                    </div>

                    <div class="empty-box" *ngIf="!loading && snapshots.length === 0">
                        <mat-icon>history_toggle_off</mat-icon>
                        <p>Nenhum snapshot anterior registrado para este bloco.</p>
                        <small>Snapshots são gravados automaticamente a cada atualização sincronizada.</small>
                    </div>

                    <button
                        type="button"
                        class="snapshot-item"
                        *ngFor="let snap of snapshots; let i = index"
                        [class.selected]="selectedSnapshot === snap"
                        (click)="selecionarSnapshot(snap)">
                        <div class="snap-header">
                            <strong>Versão #{{ snapshots.length - i }}</strong>
                            <span class="snap-date">{{ snap.createdAt | date:'dd/MM/yyyy HH:mm:ss' }}</span>
                        </div>
                        <div class="snap-hash" *ngIf="snap.hash">
                            <code>{{ snap.hash.slice(0, 12) }}...</code>
                        </div>
                    </button>
                </aside>

                <section class="snapshot-viewer">
                    <ng-container *ngIf="selectedSnapshot; else selectPrompt">
                        <ng-container *ngIf="codexComponent; else fallbackViewer">
                            <ng-container
                                *ngComponentOutlet="codexComponent; inputs: {
                                    language: 'json',
                                    value: selectedSnapshotCode,
                                    originalValue: currentSpecCode
                                }">
                            </ng-container>
                        </ng-container>

                        <ng-template #fallbackViewer>
                            <pre class="fallback-code">{{ selectedSnapshotCode }}</pre>
                        </ng-template>
                    </ng-container>

                    <ng-template #selectPrompt>
                        <div class="empty-box">
                            <mat-icon>code</mat-icon>
                            <p>Selecione um snapshot à esquerda para inspecionar a implementação anterior.</p>
                        </div>
                    </ng-template>
                </section>
            </div>
        </mat-dialog-content>

        <mat-dialog-actions align="end">
            <button mat-button mat-dialog-close>Fechar</button>
            <button
                mat-flat-button
                color="primary"
                [disabled]="!selectedSnapshot"
                (click)="restaurar()">
                <mat-icon>restore</mat-icon>
                Restaurar esta versão
            </button>
        </mat-dialog-actions>
    `,
    styles: [`
        .history-title {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .codex-badge {
            margin-left: auto;
            font-size: 11px;
            font-weight: 600;
            padding: 2px 10px;
            border-radius: 999px;
            background: rgba(37, 99, 235, 0.12);
            color: #1d4ed8;
        }
        .history-content {
            min-width: min(86vw, 960px);
            height: min(70vh, 580px);
            padding-top: 8px;
        }
        .history-layout {
            display: grid;
            grid-template-columns: 260px 1fr;
            gap: 12px;
            height: 100%;
        }
        .snapshots-list {
            border: 1px solid rgba(15, 23, 42, 0.1);
            border-radius: 10px;
            padding: 8px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        .snapshot-item {
            text-align: left;
            padding: 10px;
            border-radius: 8px;
            border: 1px solid rgba(15, 23, 42, 0.08);
            background: #fff;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            gap: 4px;
            &.selected {
                border-color: #2563eb;
                background: #eff6ff;
            }
            .snap-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 12px;
                .snap-date { color: #64748b; font-size: 11px; }
            }
            .snap-hash code {
                font-size: 11px;
                color: #475569;
            }
        }
        .snapshot-viewer {
            border: 1px solid rgba(15, 23, 42, 0.1);
            border-radius: 10px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            min-height: 0;
        }
        .fallback-code {
            margin: 0;
            padding: 14px;
            flex: 1;
            overflow: auto;
            background: #0f172a;
            color: #e2e8f0;
            font-family: Consolas, monospace;
            font-size: 12px;
        }
        .loading-box, .empty-box {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 24px 12px;
            gap: 8px;
            color: #64748b;
            height: 100%;
        }
        @media (max-width: 780px) {
            .history-layout { grid-template-columns: 1fr; }
        }
    `],
})
export class BlockHistoryDialogComponent implements OnInit {
    protected snapshots: BlockSnapshotDto[] = [];
    protected selectedSnapshot: BlockSnapshotDto | null = null;
    protected selectedSnapshotCode = '';
    protected currentSpecCode = '';
    protected loading = false;

    /** Componente do CodeX descoberto indiretamente via `data.manifest` */
    codexComponent?: Type<any>;

    constructor(
        @Inject(MAT_DIALOG_DATA) public readonly data: BlockHistoryDialogData,
        private readonly dialogRef: MatDialogRef<BlockHistoryDialogComponent>,
        @Optional() private readonly blockService?: BlockService,
        @Optional() private readonly appsService?: Apps,
    ) {
        this.currentSpecCode = JSON.stringify(
            data.currentSpec || data.block.code || {},
            null,
            2
        );
    }

    async ngOnInit(): Promise<void> {
        await Promise.all([
            this.descobrirCodexViaMetadados(),
            this.carregarSnapshots(),
        ]);
    }

    async descobrirCodexViaMetadados(): Promise<void> {
        if (!this.appsService) return;
        try {
            const matches = await this.appsService.findCompatibleApps({
                action: 'open',
                fileName: 'snapshot.json',
            });
            const codexMatch = matches.find(
                m => (m.appName || '').toLowerCase() === 'codex' && !!m.component
            ) || matches.find(m => !!m.component);

            if (codexMatch?.component) {
                this.codexComponent = codexMatch.component;
            }
        } catch {
            this.codexComponent = undefined;
        }
    }

    async carregarSnapshots(): Promise<void> {
        if (!this.blockService || !this.data.block?.internalId) return;
        this.loading = true;
        try {
            const list = await lastValueFrom(
                this.blockService.getSnapshots({
                    body: { internalId: this.data.block.internalId },
                })
            );
            this.snapshots = Array.isArray(list) ? list : [];
            if (this.snapshots.length > 0) {
                this.selecionarSnapshot(this.snapshots[0]);
            }
        } catch {
            this.snapshots = [];
        } finally {
            this.loading = false;
        }
    }

    selecionarSnapshot(snap: BlockSnapshotDto): void {
        this.selectedSnapshot = snap;
        const payload = (snap.snap as any)?.code || snap.snap || {};
        this.selectedSnapshotCode = JSON.stringify(payload, null, 2);
    }

    restaurar(): void {
        if (!this.selectedSnapshot) return;
        const snapObj = (this.selectedSnapshot.snap as any) || {};
        const restoredSpec: DynamicBlockSpecification = snapObj.code || snapObj;
        this.dialogRef.close(restoredSpec);
    }
}
