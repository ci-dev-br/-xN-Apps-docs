import { Component, EventEmitter, Input, OnInit, Optional, Output, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { CarteiraService, DashboardCarteirasDto, PeriodoDashboardCarteira } from '@ci/portal-api';

@Component({
    selector: 'ci-card--carteira-desempenho-comparativo',
    standalone: true,
    imports: [CommonModule, MatIconModule, MatButtonModule, MatTooltipModule, CurrencyPipe, DecimalPipe],
    styles: [`
        :host {
            display: block;
            inline-size: 100%;
            block-size: 100%;
        }
        .wallets-comparison-card {
            block-size: 100%;
            background: var(--mat-sys-surface, #ffffff);
            border: 1px solid var(--mat-sys-outline-variant, #e2e8f0);
            border-radius: 18px;
            padding: 20px 24px;
            display: flex;
            flex-direction: column;
            gap: 16px;
            box-sizing: border-box;
            box-shadow: 0 4px 14px rgba(15, 23, 42, 0.03);
        }
        .comp-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 12px;
        }
        .comp-header h4 {
            margin: 0 0 2px 0;
            font-size: 1.05rem;
            font-weight: 800;
            color: var(--mat-sys-on-surface, #0f172a);
        }
        .comp-header p {
            margin: 0;
            font-size: 0.8rem;
            color: var(--mat-sys-on-surface-variant, #64748b);
        }
        .comp-table-wrapper {
            inline-size: 100%;
            overflow-x: auto;
            scrollbar-gutter: stable;
        }
        .wallets-perf-table {
            inline-size: 100%;
            border-collapse: collapse;
            text-align: left;
        }
        .wallets-perf-table th {
            font-size: 0.74rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            color: var(--mat-sys-on-surface-variant, #64748b);
            padding: 10px 12px;
            border-bottom: 1px solid var(--mat-sys-outline-variant, #e2e8f0);
            white-space: nowrap;
        }
        .wallets-perf-table td {
            padding: 14px 12px;
            border-bottom: 1px solid var(--mat-sys-outline-variant, #f1f5f9);
            vertical-align: middle;
        }
        .wallets-perf-table tr:last-child td {
            border-bottom: none;
        }
        .wallets-perf-table tr.selected-row {
            background: rgba(79, 70, 229, 0.04);
        }
        .text-right {
            text-align: right;
        }
        .cell-wallet-id {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .theme-bar {
            inline-size: 4px;
            block-size: 34px;
            border-radius: 4px;
            flex-shrink: 0;
        }
        .cell-wallet-id strong {
            font-size: 0.9rem;
            color: var(--mat-sys-on-surface, #0f172a);
        }
        .sub-badges {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-top: 3px;
        }
        .badge-type {
            font-size: 0.65rem;
            font-weight: 700;
            padding: 1px 6px;
            border-radius: 4px;
            background: rgba(16, 185, 129, 0.12);
            color: #059669;
        }
        .badge-type.param {
            background: rgba(124, 58, 237, 0.12);
            color: #7c3aed;
        }
        .badge-ticker {
            font-size: 0.7rem;
            font-weight: 700;
            color: var(--mat-sys-on-surface-variant, #64748b);
        }
        .cell-pos,
        .cell-brl,
        .cell-gain,
        .cell-loss,
        .cell-net {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }
        .cell-pos strong,
        .cell-brl strong,
        .cell-gain strong,
        .cell-loss strong,
        .cell-net strong {
            font-size: 0.9rem;
            color: var(--mat-sys-on-surface, #0f172a);
        }
        .cell-pos small,
        .cell-brl small,
        .cell-gain small,
        .cell-loss small,
        .cell-net small {
            font-size: 0.72rem;
            color: var(--mat-sys-on-surface-variant, #64748b);
        }
        .gain-val {
            color: #16a34a !important;
        }
        .loss-val {
            color: #dc2626 !important;
        }
        .var-pill {
            align-self: flex-start;
            font-size: 0.7rem;
            font-weight: 700;
            padding: 1px 7px;
            border-radius: 9999px;
        }
        .var-pill.pos {
            background: rgba(22, 163, 74, 0.12);
            color: #15803d;
        }
        .var-pill.neg {
            background: rgba(220, 38, 38, 0.12);
            color: #b91c1c;
        }
        .row-actions {
            display: inline-flex;
            align-items: center;
            gap: 4px;
        }
    `],
    template: `
    <div class="wallets-comparison-card">
        <div class="comp-header">
            <div>
                <h4>Desempenho Individual por Carteira — Posição, Ganhos e Perdas</h4>
                <p>Acompanhe os ganhos (+), baixas (-), resultado líquido e atingimento de meta de cada carteira real ou parametrizada.</p>
            </div>
            <button mat-stroked-button color="primary" (click)="irParaLancamentoGeral()">
                <mat-icon>tune</mat-icon>
                <span>Atualizar Posição</span>
            </button>
        </div>

        <div class="comp-table-wrapper">
            <table class="wallets-perf-table">
                <thead>
                    <tr>
                        <th>Carteira / Lastro</th>
                        <th>Posição Atual</th>
                        <th>Equivalente (R$)</th>
                        <th>Ganhos no Período (+)</th>
                        <th>Perdas / Baixas (-)</th>
                        <th>Resultado Líquido (P&L)</th>
                        <th class="text-right">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    @for (d of (dadosAtivos?.desempenhoCarteiras || []); track d.carteiraId) {
                        <tr [class.selected-row]="d.carteiraId === carteiraSelecionadaId">
                            <td>
                                <div class="cell-wallet-id">
                                    <span class="theme-bar" [style.background]="corHexPorTema(d.corTema)"></span>
                                    <div>
                                        <strong>{{ d.nome }}</strong>
                                        <div class="sub-badges">
                                            <span class="badge-type" [class.param]="d.tipoLastro === 'PARAMETRIZADA'">
                                                {{ d.tipoLastro === 'PARAMETRIZADA' ? 'PARAMETRIZADA' : 'MOEDA REAL' }}
                                            </span>
                                            <span class="badge-ticker">{{ d.moeda }}</span>
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div class="cell-pos">
                                    <strong>{{ d.simboloMoeda }} {{ d.saldoAtual | number:'1.2-2' }}</strong>
                                    <small>1 {{ d.moeda }} = R$ {{ d.fatorConversaoBrl | number:'1.2-4' }}</small>
                                </div>
                            </td>
                            <td>
                                <div class="cell-brl">
                                    <strong>{{ d.saldoAtualBrl | currency:'BRL':'symbol':'1.2-2' }}</strong>
                                    <small>{{ d.participacaoPercentual }}% do total</small>
                                </div>
                            </td>
                            <td>
                                <div class="cell-gain">
                                    <strong class="gain-val">+ {{ d.simboloMoeda }} {{ d.ganhosPeriodoMoeda | number:'1.2-2' }}</strong>
                                    <small>+ {{ d.ganhosPeriodoBrl | currency:'BRL':'symbol':'1.2-2' }}</small>
                                </div>
                            </td>
                            <td>
                                <div class="cell-loss">
                                    <strong class="loss-val">- {{ d.simboloMoeda }} {{ d.perdasPeriodoMoeda | number:'1.2-2' }}</strong>
                                    <small>- {{ d.perdasPeriodoBrl | currency:'BRL':'symbol':'1.2-2' }}</small>
                                </div>
                            </td>
                            <td>
                                <div class="cell-net">
                                    <strong [class.gain-val]="d.resultadoLiquidoBrl >= 0" [class.loss-val]="d.resultadoLiquidoBrl < 0">
                                        {{ d.resultadoLiquidoBrl >= 0 ? '+' : '' }}{{ d.resultadoLiquidoBrl | currency:'BRL':'symbol':'1.2-2' }}
                                    </strong>
                                    <span class="var-pill" [class.pos]="d.rentabilidadePercentual >= 0" [class.neg]="d.rentabilidadePercentual < 0">
                                        {{ d.rentabilidadePercentual >= 0 ? '+' : '' }}{{ d.rentabilidadePercentual | number:'1.1-2' }}%
                                    </span>
                                </div>
                            </td>
                            <td class="text-right">
                                <div class="row-actions">
                                    <button mat-icon-button matTooltip="Selecionar carteira e ver extrato" (click)="aoFocarExtrato(d.carteiraId)">
                                        <mat-icon>visibility</mat-icon>
                                    </button>
                                    <button mat-icon-button color="primary" matTooltip="Lançar ou atualizar posição desta carteira" (click)="aoAtualizarPosicao(d.carteiraId)">
                                        <mat-icon>trending_up</mat-icon>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    }
                </tbody>
            </table>
        </div>
    </div>
    `
})
export class CarteiraDesempenhoComparativoCard implements OnInit {
    @Input() dashboard?: DashboardCarteirasDto;
    @Input() carteiraSelecionadaId?: string;
    @Input() periodo: PeriodoDashboardCarteira = '30D';
    @Output() focarExtrato = new EventEmitter<string>();
    @Output() atualizarPosicao = new EventEmitter<string>();

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
        this.carteiraService.obterDashboardCarteiras(this.periodo).subscribe({
            next: (d) => {
                this.dadosRemotos = d;
                this.cdr?.markForCheck();
                this.cdr?.detectChanges();
            }
        });
    }

    aoFocarExtrato(carteiraId: string): void {
        if (this.focarExtrato.observed) {
            this.focarExtrato.emit(carteiraId);
        } else {
            this.router?.navigate(['/Financeiro/Carteira']);
        }
    }

    aoAtualizarPosicao(carteiraId: string): void {
        if (this.atualizarPosicao.observed) {
            this.atualizarPosicao.emit(carteiraId);
        } else {
            this.router?.navigate(['/Financeiro/Carteira/Lancamento']);
        }
    }

    irParaLancamentoGeral(): void {
        if (this.atualizarPosicao.observed && this.carteiraSelecionadaId) {
            this.atualizarPosicao.emit(this.carteiraSelecionadaId);
        } else {
            this.router?.navigate(['/Financeiro/Carteira/Lancamento']);
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

export const CarteiraDesempenhoComparativoCardInfo = {
    title: 'Quadro Comparativo de Desempenho das Carteiras',
    descricao: 'Tabela comparativa de posição atual, equivalente em R$, ganhos (+), perdas (-) e rentabilidade líquida por carteira.',
    icon: 'table_chart',
    category: 'Financeiro',
    tags: ['Carteira', 'Comparativo', 'Desempenho', 'Posição', 'P&L', 'Financeiro'],
    dimensions: { cols: 2, rows: 1 },
    componentRef: CarteiraDesempenhoComparativoCard,
    componentVersion: '1.0.0',
    componentName: 'CarteiraDesempenhoComparativoCard',
    settings: {
        periodo: { label: 'Período (7D, 30D, 90D, 12M, TUDO)' }
    }
};
