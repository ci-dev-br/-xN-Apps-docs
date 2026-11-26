import { Component, Input, OnInit, Optional, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import {
    CarteiraService,
    DashboardCarteirasDto,
    PeriodoDashboardCarteira
} from '@ci/portal-api';

const KPI_CARD_STYLES = [`
    :host {
        display: block;
        inline-size: 100%;
        block-size: 100%;
    }
    .kpi-analysis-card {
        block-size: 100%;
        background: var(--mat-sys-surface, #ffffff);
        border: 1px solid var(--mat-sys-outline-variant, #e2e8f0);
        border-radius: 16px;
        padding: 18px 20px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 10px;
        min-inline-size: 0;
        box-sizing: border-box;
        box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
        transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }
    .kpi-analysis-card:hover {
        border-color: rgba(79, 70, 229, 0.35);
        box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);
    }
    .kpi-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
    }
    .kpi-label {
        font-size: 0.76rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--mat-sys-on-surface-variant, #64748b);
    }
    .kpi-badge,
    .kpi-icon-pill {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 0.72rem;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 9999px;
    }
    .kpi-badge mat-icon,
    .kpi-icon-pill mat-icon {
        font-size: 14px;
        inline-size: 14px;
        block-size: 14px;
    }
    .kpi-badge.positive,
    .kpi-icon-pill.gain {
        background: rgba(22, 163, 74, 0.12);
        color: #15803d;
    }
    .kpi-badge.negative,
    .kpi-icon-pill.loss {
        background: rgba(220, 38, 38, 0.12);
        color: #b91c1c;
    }
    .kpi-value {
        font-size: 1.55rem;
        font-weight: 800;
        letter-spacing: -0.02em;
        color: var(--mat-sys-on-surface, #0f172a);
    }
    .kpi-value.gain-text {
        color: #16a34a;
    }
    .kpi-value.loss-text {
        color: #dc2626;
    }
    .kpi-sub-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
        flex-wrap: wrap;
        font-size: 0.76rem;
        color: var(--mat-sys-on-surface-variant, #64748b);
        border-top: 1px dashed var(--mat-sys-outline-variant, #e2e8f0);
        padding-top: 8px;
    }
    .board-mini-periods {
        display: inline-flex;
        gap: 3px;
    }
    .mini-p-btn {
        border: 1px solid var(--mat-sys-outline-variant, #cbd5e1);
        background: transparent;
        border-radius: 5px;
        padding: 1px 5px;
        font-size: 0.65rem;
        font-weight: 700;
        cursor: pointer;
        color: var(--mat-sys-on-surface-variant, #64748b);
    }
    .mini-p-btn.active {
        background: var(--mat-sys-primary, #4f46e5);
        border-color: var(--mat-sys-primary, #4f46e5);
        color: #ffffff;
    }
`];

/**
 * 1. Card de Análise: Patrimônio Consolidado & Variação no Período
 */
@Component({
    selector: 'ci-card--carteira-patrimonio-kpi',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule, CurrencyPipe, DecimalPipe],
    styles: KPI_CARD_STYLES,
    template: `
    <div class="kpi-analysis-card">
        <div class="kpi-top">
            <span class="kpi-label">Patrimônio Consolidado</span>
            <span class="kpi-badge"
                  [class.positive]="(resumo?.variacaoPercentualPeriodo || 0) >= 0"
                  [class.negative]="(resumo?.variacaoPercentualPeriodo || 0) < 0">
                <mat-icon>{{ (resumo?.variacaoPercentualPeriodo || 0) >= 0 ? 'trending_up' : 'trending_down' }}</mat-icon>
                {{ (resumo?.variacaoPercentualPeriodo || 0) >= 0 ? '+' : '' }}{{ (resumo?.variacaoPercentualPeriodo || 0) | number:'1.1-2' }}%
            </span>
        </div>

        <strong class="kpi-value">
            @if (mostrarSaldo) {
                {{ (resumo?.patrimonioTotalBrl || 0) | currency:'BRL':'symbol':'1.2-2' }}
            } @else {
                R$ ••••••••
            }
        </strong>

        <div class="kpi-sub-row">
            <div>
                <span>Real: {{ resumo?.percentualMoedaReal || 0 }}%</span>
                <span> · </span>
                <span>Parametrizado: {{ resumo?.percentualParametrizado || 0 }}%</span>
            </div>
            @if (!dashboard) {
                <div class="board-mini-periods">
                    @for (p of periodos; track p) {
                        <button type="button" class="mini-p-btn" [class.active]="periodo === p" (click)="trocarPeriodo(p)">{{ p }}</button>
                    }
                </div>
            }
        </div>
    </div>
    `
})
export class CarteiraPatrimonioKpiCard implements OnInit {
    @Input() dashboard?: DashboardCarteirasDto;
    @Input() mostrarSaldo = true;
    @Input() periodo: PeriodoDashboardCarteira = '30D';
    periodos: PeriodoDashboardCarteira[] = ['7D', '30D', '90D', 'TUDO'];
    dadosRemotos?: DashboardCarteirasDto;

    constructor(
        @Optional() private readonly carteiraService?: CarteiraService,
        @Optional() private readonly cdr?: ChangeDetectorRef,
    ) { }

    get resumo() {
        return (this.dashboard || this.dadosRemotos)?.resumo;
    }

    ngOnInit(): void {
        if (!this.dashboard) {
            this.carregar();
        }
    }

    trocarPeriodo(p: PeriodoDashboardCarteira): void {
        this.periodo = p;
        this.carregar();
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
}

export const CarteiraPatrimonioKpiCardInfo = {
    title: 'Patrimônio Consolidado (Carteiras)',
    descricao: 'Indicador de patrimônio total em BRL com variação percentual e divisão entre lastro real e parametrizado.',
    icon: 'account_balance_wallet',
    category: 'Financeiro',
    tags: ['Carteira', 'Patrimônio', 'KPI', 'Financeiro'],
    dimensions: { cols: 1, rows: 1 },
    componentRef: CarteiraPatrimonioKpiCard,
    componentVersion: '1.0.0',
    componentName: 'CarteiraPatrimonioKpiCard',
    settings: {
        periodo: { label: 'Período (7D, 30D, 90D, 12M, TUDO)' }
    }
};

/**
 * 2. Card de Análise: Ganhos e Entradas no Período (+)
 */
@Component({
    selector: 'ci-card--carteira-ganhos-kpi',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, CurrencyPipe],
    styles: KPI_CARD_STYLES,
    template: `
    <div class="kpi-analysis-card">
        <div class="kpi-top">
            <span class="kpi-label">Ganhos e Entradas no Período</span>
            <span class="kpi-icon-pill gain">
                <mat-icon>north_east</mat-icon>
                +{{ resumo?.eventosPositivos || 0 }} eventos
            </span>
        </div>

        <strong class="kpi-value gain-text">
            @if (mostrarSaldo) {
                + {{ (resumo?.ganhosTotaisPeriodoBrl || 0) | currency:'BRL':'symbol':'1.2-2' }}
            } @else {
                + R$ ••••••
            }
        </strong>

        <div class="kpi-sub-row">
            <span>Valorização/Ajustes: {{ (resumo?.ganhosRendimentosValorizacaoBrl || 0) | currency:'BRL':'symbol':'1.2-2' }}</span>
            @if (!dashboard) {
                <div class="board-mini-periods">
                    @for (p of periodos; track p) {
                        <button type="button" class="mini-p-btn" [class.active]="periodo === p" (click)="trocarPeriodo(p)">{{ p }}</button>
                    }
                </div>
            }
        </div>
    </div>
    `
})
export class CarteiraGanhosKpiCard implements OnInit {
    @Input() dashboard?: DashboardCarteirasDto;
    @Input() mostrarSaldo = true;
    @Input() periodo: PeriodoDashboardCarteira = '30D';
    periodos: PeriodoDashboardCarteira[] = ['7D', '30D', '90D', 'TUDO'];
    dadosRemotos?: DashboardCarteirasDto;

    constructor(
        @Optional() private readonly carteiraService?: CarteiraService,
        @Optional() private readonly cdr?: ChangeDetectorRef,
    ) { }

    get resumo() {
        return (this.dashboard || this.dadosRemotos)?.resumo;
    }

    ngOnInit(): void {
        if (!this.dashboard) {
            this.carregar();
        }
    }

    trocarPeriodo(p: PeriodoDashboardCarteira): void {
        this.periodo = p;
        this.carregar();
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
}

export const CarteiraGanhosKpiCardInfo = {
    title: 'Ganhos e Entradas (Carteiras)',
    descricao: 'Acompanhamento de ganhos acumulados, aportes, rendimentos e valorizações das carteiras no período.',
    icon: 'trending_up',
    category: 'Financeiro',
    tags: ['Carteira', 'Ganhos', 'Entradas', 'KPI', 'Financeiro'],
    dimensions: { cols: 1, rows: 1 },
    componentRef: CarteiraGanhosKpiCard,
    componentVersion: '1.0.0',
    componentName: 'CarteiraGanhosKpiCard',
    settings: {
        periodo: { label: 'Período (7D, 30D, 90D, 12M, TUDO)' }
    }
};

/**
 * 3. Card de Análise: Perdas e Baixas no Período (-)
 */
@Component({
    selector: 'ci-card--carteira-perdas-kpi',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, CurrencyPipe],
    styles: KPI_CARD_STYLES,
    template: `
    <div class="kpi-analysis-card">
        <div class="kpi-top">
            <span class="kpi-label">Perdas e Baixas no Período</span>
            <span class="kpi-icon-pill loss">
                <mat-icon>south_east</mat-icon>
                {{ resumo?.eventosNegativos || 0 }} baixas
            </span>
        </div>

        <strong class="kpi-value loss-text">
            @if (mostrarSaldo) {
                - {{ (resumo?.perdasTotaisPeriodoBrl || 0) | currency:'BRL':'symbol':'1.2-2' }}
            } @else {
                - R$ ••••••
            }
        </strong>

        <div class="kpi-sub-row">
            <span>Saídas/Pagamentos: {{ (resumo?.retiradasPagamentosBrl || 0) | currency:'BRL':'symbol':'1.2-2' }}</span>
            @if (!dashboard) {
                <div class="board-mini-periods">
                    @for (p of periodos; track p) {
                        <button type="button" class="mini-p-btn" [class.active]="periodo === p" (click)="trocarPeriodo(p)">{{ p }}</button>
                    }
                </div>
            }
        </div>
    </div>
    `
})
export class CarteiraPerdasKpiCard implements OnInit {
    @Input() dashboard?: DashboardCarteirasDto;
    @Input() mostrarSaldo = true;
    @Input() periodo: PeriodoDashboardCarteira = '30D';
    periodos: PeriodoDashboardCarteira[] = ['7D', '30D', '90D', 'TUDO'];
    dadosRemotos?: DashboardCarteirasDto;

    constructor(
        @Optional() private readonly carteiraService?: CarteiraService,
        @Optional() private readonly cdr?: ChangeDetectorRef,
    ) { }

    get resumo() {
        return (this.dashboard || this.dadosRemotos)?.resumo;
    }

    ngOnInit(): void {
        if (!this.dashboard) {
            this.carregar();
        }
    }

    trocarPeriodo(p: PeriodoDashboardCarteira): void {
        this.periodo = p;
        this.carregar();
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
}

export const CarteiraPerdasKpiCardInfo = {
    title: 'Perdas e Baixas (Carteiras)',
    descricao: 'Monitoramento de saídas, baixas de posição, desvalorizações e pagamentos de faturas no período.',
    icon: 'trending_down',
    category: 'Financeiro',
    tags: ['Carteira', 'Perdas', 'Saídas', 'KPI', 'Financeiro'],
    dimensions: { cols: 1, rows: 1 },
    componentRef: CarteiraPerdasKpiCard,
    componentVersion: '1.0.0',
    componentName: 'CarteiraPerdasKpiCard',
    settings: {
        periodo: { label: 'Período (7D, 30D, 90D, 12M, TUDO)' }
    }
};

/**
 * 4. Card de Análise: Resultado Líquido (P&L) & Carteira Destaque
 */
@Component({
    selector: 'ci-card--carteira-resultado-liquido-kpi',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, CurrencyPipe],
    styles: KPI_CARD_STYLES,
    template: `
    <div class="kpi-analysis-card">
        <div class="kpi-top">
            <span class="kpi-label">Resultado Líquido (P&L)</span>
            <span class="kpi-badge"
                  [class.positive]="(resumo?.resultadoLiquidoPeriodoBrl || 0) >= 0"
                  [class.negative]="(resumo?.resultadoLiquidoPeriodoBrl || 0) < 0">
                {{ (resumo?.resultadoLiquidoPeriodoBrl || 0) >= 0 ? 'SUPERÁVIT' : 'DÉFICIT' }}
            </span>
        </div>

        <strong class="kpi-value"
                [class.gain-text]="(resumo?.resultadoLiquidoPeriodoBrl || 0) >= 0"
                [class.loss-text]="(resumo?.resultadoLiquidoPeriodoBrl || 0) < 0">
            @if (mostrarSaldo) {
                {{ (resumo?.resultadoLiquidoPeriodoBrl || 0) >= 0 ? '+' : '' }}{{ (resumo?.resultadoLiquidoPeriodoBrl || 0) | currency:'BRL':'symbol':'1.2-2' }}
            } @else {
                R$ ••••••
            }
        </strong>

        <div class="kpi-sub-row">
            @if (resumo?.melhorCarteira; as melhor) {
                <span>Destaque: <strong>{{ melhor.nome }} ({{ melhor.moeda }})</strong></span>
            } @else {
                <span>{{ resumo?.totalMovimentacoesPeriodo || 0 }} movimentações analisadas</span>
            }
            @if (!dashboard) {
                <div class="board-mini-periods">
                    @for (p of periodos; track p) {
                        <button type="button" class="mini-p-btn" [class.active]="periodo === p" (click)="trocarPeriodo(p)">{{ p }}</button>
                    }
                </div>
            }
        </div>
    </div>
    `
})
export class CarteiraResultadoLiquidoKpiCard implements OnInit {
    @Input() dashboard?: DashboardCarteirasDto;
    @Input() mostrarSaldo = true;
    @Input() periodo: PeriodoDashboardCarteira = '30D';
    periodos: PeriodoDashboardCarteira[] = ['7D', '30D', '90D', 'TUDO'];
    dadosRemotos?: DashboardCarteirasDto;

    constructor(
        @Optional() private readonly carteiraService?: CarteiraService,
        @Optional() private readonly router?: Router,
        @Optional() private readonly cdr?: ChangeDetectorRef,
    ) { }

    get resumo() {
        return (this.dashboard || this.dadosRemotos)?.resumo;
    }

    ngOnInit(): void {
        if (!this.dashboard) {
            this.carregar();
        }
    }

    trocarPeriodo(p: PeriodoDashboardCarteira): void {
        this.periodo = p;
        this.carregar();
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
}

export const CarteiraResultadoLiquidoKpiCardInfo = {
    title: 'Resultado Líquido P&L (Carteiras)',
    descricao: 'Saldo líquido entre ganhos e perdas no período (Superávit/Déficit) e identificação da carteira de melhor desempenho.',
    icon: 'insights',
    category: 'Financeiro',
    tags: ['Carteira', 'Resultado Líquido', 'P&L', 'KPI', 'Financeiro'],
    dimensions: { cols: 1, rows: 1 },
    componentRef: CarteiraResultadoLiquidoKpiCard,
    componentVersion: '1.0.0',
    componentName: 'CarteiraResultadoLiquidoKpiCard',
    settings: {
        periodo: { label: 'Período (7D, 30D, 90D, 12M, TUDO)' }
    }
};
