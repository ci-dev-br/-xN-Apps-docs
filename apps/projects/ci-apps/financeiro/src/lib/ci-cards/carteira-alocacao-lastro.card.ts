import { Component, EventEmitter, Input, OnInit, Optional, Output, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { CarteiraService, DashboardCarteirasDto } from '@ci/portal-api';

@Component({
    selector: 'ci-card--carteira-alocacao-lastro',
    standalone: true,
    imports: [CommonModule, MatIconModule, MatTooltipModule, CurrencyPipe, DecimalPipe],
    styles: [`
        :host {
            display: block;
            inline-size: 100%;
            block-size: 100%;
        }
        .allocation-breakdown-card {
            block-size: 100%;
            background: var(--mat-sys-surface, #ffffff);
            border: 1px solid var(--mat-sys-outline-variant, #e2e8f0);
            border-radius: 18px;
            padding: 20px 22px;
            display: flex;
            flex-direction: column;
            gap: 16px;
            min-inline-size: 0;
            box-sizing: border-box;
            box-shadow: 0 4px 14px rgba(15, 23, 42, 0.03);
        }
        .alloc-header h4 {
            margin: 0 0 2px 0;
            font-size: 1.02rem;
            font-weight: 800;
            color: var(--mat-sys-on-surface, #0f172a);
        }
        .alloc-header span {
            font-size: 0.78rem;
            color: var(--mat-sys-on-surface-variant, #64748b);
        }
        .stacked-allocation-bar {
            display: flex;
            block-size: 14px;
            inline-size: 100%;
            border-radius: 9999px;
            overflow: clip;
            background: var(--mat-sys-surface-container-high, #f1f5f9);
            gap: 2px;
        }
        .alloc-segment {
            block-size: 100%;
            transition: width 0.3s ease;
        }
        .backing-split-boxes {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }
        .split-box {
            padding: 10px 12px;
            border-radius: 12px;
            display: flex;
            flex-direction: column;
            gap: 2px;
            border: 1px solid var(--mat-sys-outline-variant, #e2e8f0);
        }
        .split-tag {
            font-size: 0.68rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.04em;
        }
        .split-box strong {
            font-size: 0.98rem;
            font-weight: 800;
            color: var(--mat-sys-on-surface, #0f172a);
        }
        .split-box small {
            font-size: 0.72rem;
            color: var(--mat-sys-on-surface-variant, #64748b);
        }
        .split-box.real {
            background: rgba(16, 185, 129, 0.06);
        }
        .split-box.real .split-tag { color: #059669; }
        .split-box.param {
            background: rgba(124, 58, 237, 0.06);
        }
        .split-box.param .split-tag { color: #7c3aed; }
        .alloc-wallets-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
            max-block-size: 185px;
            overflow-y: auto;
            scrollbar-gutter: stable;
            overscroll-behavior: contain;
        }
        .alloc-wallet-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 10px;
            border-radius: 10px;
            background: var(--mat-sys-surface-container-low, #f8fafc);
            border: 1px solid var(--mat-sys-outline-variant, #f1f5f9);
            cursor: pointer;
            transition: background 0.15s ease;
        }
        .alloc-wallet-row:hover {
            background: var(--mat-sys-surface-container-high, #f1f5f9);
        }
        .alloc-left {
            display: flex;
            align-items: center;
            gap: 10px;
            min-inline-size: 0;
        }
        .color-dot {
            inline-size: 10px;
            block-size: 10px;
            border-radius: 50%;
            flex-shrink: 0;
        }
        .alloc-left div {
            display: flex;
            flex-direction: column;
            min-inline-size: 0;
        }
        .alloc-left strong {
            font-size: 0.84rem;
            color: var(--mat-sys-on-surface, #0f172a);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .alloc-left small {
            font-size: 0.72rem;
            color: var(--mat-sys-on-surface-variant, #64748b);
        }
        .alloc-right {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-shrink: 0;
        }
        .alloc-right strong {
            font-size: 0.85rem;
            color: var(--mat-sys-on-surface, #0f172a);
        }
        .share-pill {
            font-size: 0.7rem;
            font-weight: 700;
            padding: 2px 7px;
            border-radius: 9999px;
            background: rgba(79, 70, 229, 0.1);
            color: var(--mat-sys-primary, #4f46e5);
        }
    `],
    template: `
    <div class="allocation-breakdown-card">
        <div class="alloc-header">
            <h4>Composição & Alocação por Carteira</h4>
            <span>Participação no Patrimônio Consolidado (BRL)</span>
        </div>

        <div class="stacked-allocation-bar">
            @for (item of (dadosAtivos?.desempenhoCarteiras || []); track item.carteiraId) {
                <div class="alloc-segment"
                     [style.width.%]="item.participacaoPercentual > 0 ? item.participacaoPercentual : (100 / ((dadosAtivos?.desempenhoCarteiras?.length) || 1))"
                     [style.background]="corHexPorTema(item.corTema)"
                     [matTooltip]="item.nome + ': ' + item.participacaoPercentual + '%'">
                </div>
            }
        </div>

        <div class="backing-split-boxes">
            <div class="split-box real">
                <span class="split-tag">Lastro em Moeda Real</span>
                <strong>{{ (dadosAtivos?.resumo?.patrimonioMoedaRealBrl || 0) | currency:'BRL':'symbol':'1.2-2' }}</strong>
                <small>{{ dadosAtivos?.resumo?.percentualMoedaReal || 0 }}% do portfólio</small>
            </div>
            <div class="split-box param">
                <span class="split-tag">Lastro Parametrizado</span>
                <strong>{{ (dadosAtivos?.resumo?.patrimonioParametrizadoBrl || 0) | currency:'BRL':'symbol':'1.2-2' }}</strong>
                <small>{{ dadosAtivos?.resumo?.percentualParametrizado || 0 }}% do portfólio</small>
            </div>
        </div>

        <div class="alloc-wallets-list">
            @for (item of (dadosAtivos?.desempenhoCarteiras || []); track item.carteiraId) {
                <div class="alloc-wallet-row" (click)="aoClicarCarteira(item.carteiraId)">
                    <div class="alloc-left">
                        <span class="color-dot" [style.background]="corHexPorTema(item.corTema)"></span>
                        <div>
                            <strong>{{ item.nome }}</strong>
                            <small>{{ item.simboloMoeda }} {{ item.saldoAtual | number:'1.2-2' }} ({{ item.moeda }})</small>
                        </div>
                    </div>
                    <div class="alloc-right">
                        <strong>{{ item.saldoAtualBrl | currency:'BRL':'symbol':'1.2-2' }}</strong>
                        <span class="share-pill">{{ item.participacaoPercentual }}%</span>
                    </div>
                </div>
            }
        </div>
    </div>
    `
})
export class CarteiraAlocacaoLastroCard implements OnInit {
    @Input() dashboard?: DashboardCarteirasDto;
    @Output() selecionarCarteira = new EventEmitter<string>();
    dadosRemotos?: DashboardCarteirasDto;

    constructor(
        @Optional() private readonly carteiraService?: CarteiraService,
        @Optional() private readonly router?: Router,
        @Optional() private readonly cdr?: ChangeDetectorRef,
    ) { }

    get dadosAtivos(): DashboardCarteirasDto | undefined {
        return this.dashboard || this.dadosRemotos;
    }

    ngOnInit(): void {
        if (!this.dashboard) {
            this.carregar();
        }
    }

    carregar(): void {
        if (!this.carteiraService || typeof this.carteiraService.obterDashboardCarteiras !== 'function') return;
        this.carteiraService.obterDashboardCarteiras('30D').subscribe({
            next: (d) => {
                this.dadosRemotos = d;
                this.cdr?.markForCheck();
                this.cdr?.detectChanges();
            }
        });
    }

    aoClicarCarteira(carteiraId: string): void {
        if (this.selecionarCarteira.observed) {
            this.selecionarCarteira.emit(carteiraId);
        } else {
            this.router?.navigate(['/Financeiro/Carteira']);
        }
    }

    corHexPorTema(tema?: string): string {
        const mapa: Record<string, string> = {
            indigo: '#4f46e5',
            emerald: '#10b981',
            blue: '#2563eb',
            violet: '#7c3aed',
            amber: '#f59e0b',
            purple: '#9333ea',
        };
        return mapa[tema || 'indigo'] || '#4f46e5';
    }
}

export const CarteiraAlocacaoLastroCardInfo = {
    title: 'Alocação por Carteira e Tipo de Lastro',
    descricao: 'Composição percentual do portfólio entre carteiras de Moeda Real e Moedas Parametrizadas.',
    icon: 'pie_chart',
    category: 'Financeiro',
    tags: ['Carteira', 'Alocação', 'Lastro', 'Moeda Real', 'Parametrizada', 'Financeiro'],
    dimensions: { cols: 1, rows: 1 },
    componentRef: CarteiraAlocacaoLastroCard,
    componentVersion: '1.0.0',
    componentName: 'CarteiraAlocacaoLastroCard',
    settings: {}
};
