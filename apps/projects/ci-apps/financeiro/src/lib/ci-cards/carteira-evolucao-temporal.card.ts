import { Component, Input, OnInit, Optional, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {
    CarteiraService,
    DashboardCarteirasDto,
    PeriodoDashboardCarteira,
    PontoSerieTemporalCarteiraDto
} from '@ci/portal-api';

export interface PontoRenderGraficoCard {
    indice: number;
    x: number;
    yPatrimonio: number;
    yZero: number;
    yBarraGanho: number;
    alturaBarraGanho: number;
    yBarraPerda: number;
    alturaBarraPerda: number;
    dados: PontoSerieTemporalCarteiraDto;
}

@Component({
    selector: 'ci-card--carteira-evolucao-temporal',
    standalone: true,
    imports: [CommonModule, MatIconModule, MatButtonModule, CurrencyPipe],
    styles: [`
        :host {
            display: block;
            inline-size: 100%;
            block-size: 100%;
        }
        .timeseries-chart-card {
            block-size: 100%;
            background: var(--mat-sys-surface, #ffffff);
            border: 1px solid var(--mat-sys-outline-variant, #e2e8f0);
            border-radius: 18px;
            padding: 20px 22px;
            display: flex;
            flex-direction: column;
            gap: 14px;
            min-inline-size: 0;
            box-sizing: border-box;
            box-shadow: 0 4px 14px rgba(15, 23, 42, 0.03);
        }
        .chart-card-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 12px;
        }
        .chart-card-header h4 {
            margin: 0 0 2px 0;
            font-size: 1.02rem;
            font-weight: 800;
            color: var(--mat-sys-on-surface, #0f172a);
        }
        .chart-card-header p {
            margin: 0;
            font-size: 0.78rem;
            color: var(--mat-sys-on-surface-variant, #64748b);
        }
        .header-right-controls {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
        }
        .chart-legend-inline {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
            font-size: 0.75rem;
            font-weight: 600;
            color: var(--mat-sys-on-surface-variant, #475569);
        }
        .leg-item {
            display: inline-flex;
            align-items: center;
            gap: 5px;
        }
        .dot {
            display: inline-block;
            inline-size: 10px;
            block-size: 10px;
            border-radius: 3px;
        }
        .dot.line-pat { background: #4f46e5; border-radius: 50%; }
        .dot.bar-gain { background: #22c55e; }
        .dot.bar-loss { background: #ef4444; }
        .period-pills {
            display: inline-flex;
            gap: 4px;
            background: var(--mat-sys-surface-container-high, #f1f5f9);
            padding: 3px;
            border-radius: 8px;
        }
        .p-btn {
            border: none;
            background: transparent;
            font-size: 0.72rem;
            font-weight: 700;
            padding: 4px 8px;
            border-radius: 6px;
            cursor: pointer;
            color: var(--mat-sys-on-surface-variant, #475569);
        }
        .p-btn.active {
            background: var(--mat-sys-surface, #ffffff);
            color: var(--mat-sys-primary, #4f46e5);
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        }
        .chart-inspector-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 10px;
            background: var(--mat-sys-surface-container-low, #f8fafc);
            border: 1px solid var(--mat-sys-outline-variant, #e2e8f0);
            border-radius: 12px;
            padding: 10px 14px;
        }
        .insp-event {
            display: flex;
            align-items: center;
            gap: 8px;
            min-inline-size: 0;
        }
        .insp-date {
            font-size: 0.72rem;
            font-weight: 700;
            padding: 2px 8px;
            border-radius: 6px;
            background: var(--mat-sys-primary, #4f46e5);
            color: #ffffff;
        }
        .insp-desc {
            font-size: 0.82rem;
            color: var(--mat-sys-on-surface, #1e293b);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .insp-metrics {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
        }
        .insp-pill {
            font-size: 0.75rem;
            padding: 3px 9px;
            border-radius: 9999px;
            background: #e2e8f0;
            color: #334155;
        }
        .insp-pill.pos {
            background: rgba(22, 163, 74, 0.12);
            color: #15803d;
        }
        .insp-pill.neg {
            background: rgba(220, 38, 38, 0.12);
            color: #b91c1c;
        }
        .svg-chart-wrapper {
            inline-size: 100%;
            min-block-size: 220px;
        }
        .performance-svg {
            display: block;
            inline-size: 100%;
            block-size: 235px;
        }
        .grid-line {
            stroke: var(--mat-sys-outline-variant, #e2e8f0);
            stroke-dasharray: 4 4;
            stroke-width: 1;
        }
        .axis-baseline {
            stroke: var(--mat-sys-outline, #cbd5e1);
            stroke-width: 1.5;
        }
        .patrimonio-curve {
            stroke: #4f46e5;
            stroke-width: 3;
            stroke-linecap: round;
            stroke-linejoin: round;
        }
        .chart-point-group {
            cursor: pointer;
        }
        .svg-bar-gain {
            fill: #22c55e;
            opacity: 0.85;
            transition: opacity 0.15s ease;
        }
        .svg-bar-loss {
            fill: #ef4444;
            opacity: 0.85;
            transition: opacity 0.15s ease;
        }
        .active-guide-line {
            stroke: #6366f1;
            stroke-width: 1.5;
            stroke-dasharray: 3 3;
        }
        .svg-node-circle {
            fill: #ffffff;
            stroke: #4f46e5;
            stroke-width: 2.5;
            transition: r 0.15s ease, fill 0.15s ease;
        }
        .svg-node-circle.selected {
            fill: #4f46e5;
            stroke: #c7d2fe;
            stroke-width: 3.5;
        }
        .svg-x-label {
            font-size: 10px;
            font-weight: 600;
            fill: var(--mat-sys-on-surface-variant, #64748b);
        }
    `],
    template: `
    <div class="timeseries-chart-card">
        <div class="chart-card-header">
            <div>
                <h4>Curva de Evolução Patrimonial & Ganhos vs. Perdas</h4>
                <p>Passe o mouse ou clique sobre os marcos temporais para inspecionar ganhos (+), perdas (-) e posição acumulada em R$.</p>
            </div>
            <div class="header-right-controls">
                <div class="chart-legend-inline">
                    <span class="leg-item"><i class="dot line-pat"></i> Patrimônio (R$)</span>
                    <span class="leg-item"><i class="dot bar-gain"></i> Ganhos (+)</span>
                    <span class="leg-item"><i class="dot bar-loss"></i> Perdas (-)</span>
                </div>
                @if (!dashboard) {
                    <div class="period-pills">
                        @for (p of periodos; track p) {
                            <button type="button" class="p-btn" [class.active]="periodo === p" (click)="trocarPeriodo(p)">{{ p }}</button>
                        }
                    </div>
                }
            </div>
        </div>

        @if (pontoInspecionado(); as ptInfo) {
            <div class="chart-inspector-bar">
                <div class="insp-event">
                    <span class="insp-date">{{ ptInfo.rotulo }}</span>
                    <strong class="insp-desc">{{ ptInfo.descricaoEvento }}</strong>
                </div>
                <div class="insp-metrics">
                    <span class="insp-pill neutral">
                        Patrimônio: <strong>{{ ptInfo.patrimonioBrl | currency:'BRL':'symbol':'1.2-2' }}</strong>
                    </span>
                    @if (ptInfo.ganhosBrl > 0) {
                        <span class="insp-pill pos">
                            Ganho: <strong>+{{ ptInfo.ganhosBrl | currency:'BRL':'symbol':'1.2-2' }}</strong>
                        </span>
                    }
                    @if (ptInfo.perdasBrl > 0) {
                        <span class="insp-pill neg">
                            Perda: <strong>-{{ ptInfo.perdasBrl | currency:'BRL':'symbol':'1.2-2' }}</strong>
                        </span>
                    }
                    <span class="insp-pill" [class.pos]="ptInfo.ganhoAcumuladoBrl >= 0" [class.neg]="ptInfo.ganhoAcumuladoBrl < 0">
                        Acumulado: <strong>{{ ptInfo.ganhoAcumuladoBrl >= 0 ? '+' : '' }}{{ ptInfo.ganhoAcumuladoBrl | currency:'BRL':'symbol':'1.2-2' }}</strong>
                    </span>
                </div>
            </div>
        }

        <div class="svg-chart-wrapper">
            <svg class="performance-svg" viewBox="0 0 760 235" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="patrimonioGradCard" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#4f46e5" stop-opacity="0.32" />
                        <stop offset="100%" stop-color="#4f46e5" stop-opacity="0.02" />
                    </linearGradient>
                </defs>

                <line x1="40" y1="30" x2="728" y2="30" class="grid-line" />
                <line x1="40" y1="86" x2="728" y2="86" class="grid-line" />
                <line x1="40" y1="142" x2="728" y2="142" class="grid-line" />
                <line x1="40" y1="198" x2="728" y2="198" class="axis-baseline" />

                <path [attr.d]="caminhoAreaPatrimonioSvg()" fill="url(#patrimonioGradCard)" />
                <path [attr.d]="caminhoCurvaPatrimonioSvg()" class="patrimonio-curve" fill="none" />

                @for (pt of pontosGraficoRender(); track pt.indice) {
                    <g class="chart-point-group"
                       (mouseenter)="indicePontoSelecionado = pt.indice"
                       (click)="indicePontoSelecionado = pt.indice">
                        @if (pt.alturaBarraGanho > 0) {
                            <rect [attr.x]="pt.x - 11"
                                  [attr.y]="pt.yBarraGanho"
                                  width="10"
                                  [attr.height]="pt.alturaBarraGanho"
                                  rx="3"
                                  class="svg-bar-gain" />
                        }
                        @if (pt.alturaBarraPerda > 0) {
                            <rect [attr.x]="pt.x + 1"
                                  [attr.y]="pt.yBarraPerda"
                                  width="10"
                                  [attr.height]="pt.alturaBarraPerda"
                                  rx="3"
                                  class="svg-bar-loss" />
                        }

                        @if (pontoInspecionado()?.indice === pt.indice) {
                            <line [attr.x1]="pt.x" y1="20" [attr.x2]="pt.x" y2="198" class="active-guide-line" />
                        }

                        <circle [attr.cx]="pt.x"
                                [attr.cy]="pt.yPatrimonio"
                                [attr.r]="pontoInspecionado()?.indice === pt.indice ? 6.5 : 4.5"
                                class="svg-node-circle"
                                [class.selected]="pontoInspecionado()?.indice === pt.indice" />

                        <text [attr.x]="pt.x" y="218" text-anchor="middle" class="svg-x-label">
                            {{ pt.dados.rotulo }}
                        </text>
                    </g>
                }
            </svg>
        </div>
    </div>
    `
})
export class CarteiraEvolucaoTemporalCard implements OnInit {
    @Input() dashboard?: DashboardCarteirasDto;
    @Input() periodo: PeriodoDashboardCarteira = '30D';
    periodos: PeriodoDashboardCarteira[] = ['7D', '30D', '90D', '12M', 'TUDO'];
    dadosRemotos?: DashboardCarteirasDto;
    indicePontoSelecionado: number | null = null;

    constructor(
        @Optional() private readonly carteiraService?: CarteiraService,
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

    trocarPeriodo(p: PeriodoDashboardCarteira): void {
        this.periodo = p;
        this.carregar();
    }

    carregar(): void {
        if (!this.carteiraService || typeof this.carteiraService.obterDashboardCarteiras !== 'function') return;
        this.carteiraService.obterDashboardCarteiras(this.periodo).subscribe({
            next: (d) => {
                this.dadosRemotos = d;
                this.indicePontoSelecionado = null;
                this.cdr?.markForCheck();
                this.cdr?.detectChanges();
            }
        });
    }

    pontosGraficoRender(): PontoRenderGraficoCard[] {
        const serie = this.dadosAtivos?.serieTemporal || [];
        if (serie.length === 0) return [];

        const larguraUtil = 680;
        const offsetX = 44;
        const topoY = 24;
        const basePatrimonioY = 198;
        const alturaUtil = basePatrimonioY - topoY;

        const maxVal = Math.max(
            1,
            ...serie.map(p => Math.max(p.patrimonioBrl || 0, p.ganhosBrl || 0, p.perdasBrl || 0))
        );

        return serie.map((p, idx) => {
            const x = serie.length === 1
                ? offsetX + larguraUtil / 2
                : Number((offsetX + (idx / (serie.length - 1)) * larguraUtil).toFixed(1));

            const ratioPat = Math.min(1, Math.max(0, (p.patrimonioBrl || 0) / maxVal));
            const yPatrimonio = Number((basePatrimonioY - ratioPat * alturaUtil).toFixed(1));

            const alturaBarraGanho = Number((Math.min(1, (p.ganhosBrl || 0) / maxVal) * (alturaUtil * 0.72)).toFixed(1));
            const yBarraGanho = Number((basePatrimonioY - alturaBarraGanho).toFixed(1));

            const alturaBarraPerda = Number((Math.min(1, (p.perdasBrl || 0) / maxVal) * (alturaUtil * 0.72)).toFixed(1));
            const yBarraPerda = Number((basePatrimonioY - alturaBarraPerda).toFixed(1));

            return {
                indice: idx,
                x,
                yPatrimonio,
                yZero: basePatrimonioY,
                yBarraGanho,
                alturaBarraGanho,
                yBarraPerda,
                alturaBarraPerda,
                dados: p,
            };
        });
    }

    caminhoCurvaPatrimonioSvg(): string {
        const pts = this.pontosGraficoRender();
        if (pts.length === 0) return '';
        if (pts.length === 1) {
            return `M 44 ${pts[0].yPatrimonio} L 724 ${pts[0].yPatrimonio}`;
        }
        return pts.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.yPatrimonio}`).join(' ');
    }

    caminhoAreaPatrimonioSvg(): string {
        const pts = this.pontosGraficoRender();
        if (pts.length === 0) return '';
        const base = 198;
        if (pts.length === 1) {
            return `M 44 ${base} L 44 ${pts[0].yPatrimonio} L 724 ${pts[0].yPatrimonio} L 724 ${base} Z`;
        }
        const linha = pts.map(pt => `L ${pt.x} ${pt.yPatrimonio}`).join(' ');
        return `M ${pts[0].x} ${base} ${linha} L ${pts[pts.length - 1].x} ${base} Z`;
    }

    pontoInspecionado(): PontoSerieTemporalCarteiraDto | null {
        const serie = this.dadosAtivos?.serieTemporal || [];
        if (serie.length === 0) return null;
        if (this.indicePontoSelecionado !== null && serie[this.indicePontoSelecionado]) {
            return serie[this.indicePontoSelecionado];
        }
        return serie[serie.length - 1];
    }
}

export const CarteiraEvolucaoTemporalCardInfo = {
    title: 'Evolução Patrimonial & Ganhos vs. Perdas',
    descricao: 'Gráfico interativo de evolução do patrimônio consolidado com barras comparativas de ganhos (+) e perdas (-) ao longo do tempo.',
    icon: 'show_chart',
    category: 'Financeiro',
    tags: ['Carteira', 'Gráfico', 'Evolução', 'Ganhos e Perdas', 'Financeiro'],
    dimensions: { cols: 2, rows: 1 },
    componentRef: CarteiraEvolucaoTemporalCard,
    componentVersion: '1.0.0',
    componentName: 'CarteiraEvolucaoTemporalCard',
    settings: {
        periodo: { label: 'Período (7D, 30D, 90D, 12M, TUDO)' }
    }
};
