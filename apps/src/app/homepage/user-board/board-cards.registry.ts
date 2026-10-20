import { Type } from '@angular/core';
import {
    MacroIndicatorsCard,
    MacroIndicatorsCardInfo,
    RecentQuotesCard,
    RecentQuotesCardInfo,
    FundamentalIndicatorsCard,
    FundamentalIndicatorsCardInfo,
    FinancialHealthCard,
    FinancialHealthCardInfo
} from '@ci-apps/Financeiro';
import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

// Card de Atalho e Resumo de Aplicação Genérica/Ativa
@Component({
    selector: 'ci-app-quick-card',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
    template: `
        <mat-card class="app-quick-card">
            <mat-card-header>
                <div mat-card-avatar class="app-avatar" [style.background-color]="appColor">
                    <mat-icon>{{ appIcon || 'apps' }}</mat-icon>
                </div>
                <mat-card-title>{{ appName }}</mat-card-title>
                <mat-card-subtitle>{{ appCategory || 'Aplicativo Ativo' }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
                <p class="app-desc">{{ appDescription || 'Acesse o aplicativo diretamente pelo seu painel operacional.' }}</p>
                <div class="app-status-badge">
                    <span class="status-dot"></span>
                    <span>Ativo na sua conta</span>
                </div>
            </mat-card-content>
            <mat-card-actions align="end">
                <a mat-button color="primary" [href]="appUrl || '#'">
                    <mat-icon>launch</mat-icon> Abrir App
                </a>
            </mat-card-actions>
        </mat-card>
    `,
    styles: [`
        .app-quick-card {
            width: 100%;
            height: 100%;
            background: var(--mat-sys-surface, #ffffff);
            border: 1px solid var(--mat-sys-outline-variant, #e0e0e0);
        }
        .app-avatar {
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            color: #ffffff;
        }
        .app-desc {
            font-size: 0.85rem;
            color: var(--mat-sys-on-surface-variant, #666);
            margin: 8px 0;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        .app-status-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 0.75rem;
            color: var(--mat-sys-tertiary, #2e7d32);
            background: var(--mat-sys-tertiary-container, rgba(46, 125, 50, 0.08));
            padding: 2px 8px;
            border-radius: 12px;
            margin-top: 4px;
        }
        .status-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: var(--mat-sys-tertiary, #2e7d32);
        }
    `]
})
export class AppQuickCard {
    @Input() appName = 'Aplicativo';
    @Input() appUrl = '/painel';
    @Input() appIcon = 'apps';
    @Input() appColor = '#3f51b5';
    @Input() appCategory = 'Geral';
    @Input() appDescription = '';
}

export interface IBoardCardDef {
    id: string;
    appKey: string;
    appName: string;
    title: string;
    description: string;
    icon: string;
    tags: string[];
    componentRef: Type<any>;
    defaultInputs?: Record<string, any>;
}

export const BOARD_CARDS_CATALOG: IBoardCardDef[] = [
    // Cards do Aplicativo Financeiro
    {
        id: 'fin_macro_indicators',
        appKey: 'Financeiro',
        appName: 'Financeiro',
        title: 'Panorama Econômico (BCB)',
        description: 'Acompanhe Selic, CDI, IPCA, IGP-M, Dólar e Euro com dados do Banco Central.',
        icon: 'trending_up',
        tags: ['Financeiro', 'BCB', 'Macroeconomia', 'Câmbio'],
        componentRef: MacroIndicatorsCard
    },
    {
        id: 'fin_recent_quotes',
        appKey: 'Financeiro',
        appName: 'Financeiro',
        title: 'Cotações Recentes B3',
        description: 'Últimos pregões e variação diária de ações negociadas na B3 (ex: PETR4, VALE3).',
        icon: 'show_chart',
        tags: ['Financeiro', 'B3', 'Ações', 'Mercado'],
        componentRef: RecentQuotesCard,
        defaultInputs: { ticker: 'PETR4' }
    },
    {
        id: 'fin_fundamental_indicators',
        appKey: 'Financeiro',
        appName: 'Financeiro',
        title: 'Análise Fundamentalista',
        description: 'Métricas P/L, P/VP, LPA e VPA com base em balanços corporativos.',
        icon: 'query_stats',
        tags: ['Financeiro', 'B3', 'Valuation', 'Múltiplos'],
        componentRef: FundamentalIndicatorsCard,
        defaultInputs: { ticker: 'WEGE3' }
    },
    {
        id: 'fin_health_cvm',
        appKey: 'Financeiro',
        appName: 'Financeiro',
        title: 'Saúde Financeira e DRE',
        description: 'Demonstrativo de resultado, EBITDA, patrimônio líquido e endividamento via CVM.',
        icon: 'account_balance_wallet',
        tags: ['Financeiro', 'CVM', 'Balanço', 'DRE'],
        componentRef: FinancialHealthCard,
        defaultInputs: { ticker: 'ITUB4' }
    }
];

/**
 * Cria a definição de um card dinâmico para uma aplicação ativa arbitrária
 */
export function createGenericAppCardDef(app: any): IBoardCardDef {
    const appKey = app.name || app.url?.replace(/^\//, '') || 'App';
    return {
        id: `app_card_${appKey}`,
        appKey: appKey,
        appName: app.name || appKey,
        title: `Visão Geral: ${app.name || appKey}`,
        description: app.shortDescription || app.description || 'Atalho operacional e métricas do aplicativo.',
        icon: app.icon || 'apps',
        tags: [app.categoria || 'Geral', 'Produtividade'],
        componentRef: AppQuickCard,
        defaultInputs: {
            appName: app.name || appKey,
            appUrl: app.url,
            appIcon: app.icon || 'apps',
            appColor: app.color || '#3f51b5',
            appCategory: app.categoria || 'Geral',
            appDescription: app.shortDescription || app.description || ''
        }
    };
}
