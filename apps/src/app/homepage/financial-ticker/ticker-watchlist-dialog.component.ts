import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export type WatchlistCategory = 'macro' | 'currency' | 'b3' | 'crypto';

export interface WatchlistOption {
    key: string;
    label: string;
    subtitle?: string;
    category: WatchlistCategory;
    isCustom?: boolean;
}

export interface TickerWatchlistDialogData {
    options: WatchlistOption[];
    selectedKeys: string[];
    defaultKeys: string[];
}

export interface TickerWatchlistDialogResult {
    selectedKeys: string[];
    customB3Tickers: string[];
}

@Component({
    selector: 'ci-ticker-watchlist-dialog',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatButtonModule,
        MatCheckboxModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
    ],
    template: `
        <h2 mat-dialog-title class="dialog-title">
            <mat-icon>tune</mat-icon>
            <span>Índices para Assistir</span>
        </h2>

        <mat-dialog-content class="dialog-content">
            <p class="dialog-hint">
                Selecione os indicadores macroeconômicos, câmbio, ações da B3 e índices de criptomoedas que deseja acompanhar na barra.
            </p>

            <div class="toolbar-row">
                <mat-form-field appearance="outline" class="filter-field" subscriptSizing="dynamic">
                    <mat-label>Filtrar índices</mat-label>
                    <input matInput [(ngModel)]="filterText" placeholder="Ex.: Selic, BTC, PETR4, Medo..." />
                    @if (filterText) {
                        <button mat-icon-button matSuffix (click)="filterText = ''" aria-label="Limpar filtro">
                            <mat-icon>close</mat-icon>
                        </button>
                    }
                </mat-form-field>

                <div class="add-ticker-row">
                    <mat-form-field appearance="outline" class="custom-ticker-field" subscriptSizing="dynamic">
                        <mat-label>Adicionar ativo B3</mat-label>
                        <input matInput [(ngModel)]="newTicker" (keydown.enter)="addCustomTicker()" placeholder="Ex.: MGLU3" maxlength="8" />
                    </mat-form-field>
                    <button mat-stroked-button color="primary" type="button" (click)="addCustomTicker()" [disabled]="!canAddTicker()">
                        <mat-icon>add</mat-icon>
                        <span>Incluir</span>
                    </button>
                </div>
            </div>

            <div class="quick-actions-row">
                <button mat-button type="button" (click)="selectAll()">Selecionar todos</button>
                <button mat-button type="button" (click)="restoreDefaults()">Restaurar padrão</button>
                <button mat-button type="button" (click)="clearAll()">Limpar</button>
                <span class="selected-counter">{{ selectedSet.size }} selecionado(s)</span>
            </div>

            <div class="categories-grid">
                @for (group of groupedOptions; track group.category) {
                    @if (group.items.length > 0) {
                        <section class="category-section">
                            <div class="category-header">
                                <mat-icon>{{ group.icon }}</mat-icon>
                                <span>{{ group.title }}</span>
                            </div>
                            <div class="options-list">
                                @for (opt of group.items; track opt.key) {
                                    <div class="option-row">
                                        <mat-checkbox
                                            [checked]="selectedSet.has(opt.key)"
                                            (change)="toggle(opt.key, $event.checked)">
                                            <span class="opt-label">{{ opt.label }}</span>
                                            @if (opt.subtitle) {
                                                <small class="opt-sub">({{ opt.subtitle }})</small>
                                            }
                                        </mat-checkbox>
                                        @if (opt.isCustom) {
                                            <button mat-icon-button class="remove-custom-btn" type="button" (click)="removeCustomOption(opt.key)">
                                                <mat-icon>delete_outline</mat-icon>
                                            </button>
                                        }
                                    </div>
                                }
                            </div>
                        </section>
                    }
                }
            </div>
        </mat-dialog-content>

        <mat-dialog-actions align="end">
            <button mat-button mat-dialog-close>Cancelar</button>
            <button mat-flat-button color="primary" (click)="save()" [disabled]="selectedSet.size === 0">
                Salvar seleção
            </button>
        </mat-dialog-actions>
    `,
    styles: [`
        .dialog-title {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 4px;
        }
        .dialog-content {
            max-width: 720px;
            width: 100%;
        }
        .dialog-hint {
            margin: 0 0 12px;
            font-size: 0.85rem;
            color: var(--mat-sys-on-surface-variant, #777);
        }
        .toolbar-row {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            align-items: center;
            margin-bottom: 10px;
        }
        .filter-field {
            flex: 1 1 220px;
        }
        .add-ticker-row {
            display: flex;
            align-items: center;
            gap: 8px;
            flex: 1 1 220px;
        }
        .custom-ticker-field {
            flex: 1 1 auto;
            min-width: 120px;
        }
        .quick-actions-row {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 4px;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid var(--mat-sys-outline-variant, rgba(128, 128, 128, 0.2));
        }
        .selected-counter {
            margin-left: auto;
            font-size: 0.8rem;
            font-weight: 600;
            color: var(--mat-sys-primary, #1976d2);
        }
        .categories-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            gap: 12px;
        }
        .category-section {
            border: 1px solid var(--mat-sys-outline-variant, rgba(128, 128, 128, 0.2));
            border-radius: 10px;
            padding: 10px 12px;
            background: var(--mat-sys-surface-container-low, rgba(128, 128, 128, 0.03));
        }
        .category-header {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 0.78rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            color: var(--mat-sys-primary, #1976d2);
            margin-bottom: 8px;

            mat-icon {
                font-size: 16px;
                width: 16px;
                height: 16px;
            }
        }
        .options-list {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }
        .option-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .opt-label {
            font-size: 0.85rem;
            font-weight: 600;
        }
        .opt-sub {
            margin-left: 4px;
            font-size: 0.75rem;
            color: var(--mat-sys-on-surface-variant, #888);
        }
        .remove-custom-btn {
            width: 28px;
            height: 28px;
            line-height: 28px;
            color: var(--mat-sys-error, #d32f2f);
        }
    `]
})
export class TickerWatchlistDialogComponent {
    options: WatchlistOption[] = [];
    selectedSet: Set<string>;
    filterText = '';
    newTicker = '';

    private readonly categoryMeta: Array<{ category: WatchlistCategory; title: string; icon: string }> = [
        { category: 'macro', title: 'Macro & Taxas (BCB)', icon: 'account_balance' },
        { category: 'currency', title: 'Câmbio', icon: 'currency_exchange' },
        { category: 'b3', title: 'B3 & Ações', icon: 'trending_up' },
        { category: 'crypto', title: 'Cripto & Índices Cripto', icon: 'currency_bitcoin' },
    ];

    constructor(
        private readonly dialogRef: MatDialogRef<TickerWatchlistDialogComponent, TickerWatchlistDialogResult>,
        @Inject(MAT_DIALOG_DATA) public readonly data: TickerWatchlistDialogData,
    ) {
        this.options = [...(data.options || [])];
        this.selectedSet = new Set(data.selectedKeys || []);
    }

    get groupedOptions() {
        const q = this.filterText.trim().toLowerCase();
        return this.categoryMeta.map(meta => ({
            ...meta,
            items: this.options.filter(opt => {
                if (opt.category !== meta.category) return false;
                if (!q) return true;
                return (
                    opt.label.toLowerCase().includes(q) ||
                    opt.key.toLowerCase().includes(q) ||
                    (opt.subtitle || '').toLowerCase().includes(q)
                );
            }),
        }));
    }

    toggle(key: string, checked: boolean): void {
        if (checked) {
            this.selectedSet.add(key);
        } else {
            this.selectedSet.delete(key);
        }
    }

    canAddTicker(): boolean {
        const clean = this.newTicker.trim().toUpperCase();
        return /^[A-Z]{4}\d{1,2}$/.test(clean) || clean === 'IBOV';
    }

    addCustomTicker(): void {
        const clean = this.newTicker.trim().toUpperCase();
        if (!this.canAddTicker()) return;

        if (!this.options.some(o => o.key === clean)) {
            this.options.push({
                key: clean,
                label: clean,
                subtitle: 'B3 Personalizado',
                category: 'b3',
                isCustom: true,
            });
        }
        this.selectedSet.add(clean);
        this.newTicker = '';
    }

    removeCustomOption(key: string): void {
        this.options = this.options.filter(o => o.key !== key);
        this.selectedSet.delete(key);
    }

    selectAll(): void {
        this.options.forEach(o => this.selectedSet.add(o.key));
    }

    restoreDefaults(): void {
        this.selectedSet = new Set(this.data.defaultKeys || []);
    }

    clearAll(): void {
        this.selectedSet.clear();
    }

    save(): void {
        const orderedKeys = this.options
            .map(o => o.key)
            .filter(k => this.selectedSet.has(k));
        const customB3Tickers = this.options
            .filter(o => o.isCustom)
            .map(o => o.key);

        this.dialogRef.close({
            selectedKeys: orderedKeys,
            customB3Tickers,
        });
    }
}
