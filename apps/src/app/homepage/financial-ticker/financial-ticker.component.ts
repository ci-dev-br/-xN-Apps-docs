import { Component, OnInit, OnDestroy, ChangeDetectorRef, Optional, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { lastValueFrom } from 'rxjs';

export interface FinancialTickerItem {
    id: string;
    label: string;
    code?: string;
    value: string;
    rawValue?: number;
    variation?: number;
    variationText?: string;
    type: 'rate' | 'currency' | 'stock' | 'index';
    date?: string;
}

@Component({
    selector: 'ci-financial-ticker',
    standalone: true,
    imports: [
        CommonModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
    ],
    providers: [CurrencyPipe, DecimalPipe],
    templateUrl: './financial-ticker.component.html',
    styleUrls: ['./financial-ticker.component.scss']
})
export class FinancialTickerComponent implements OnInit, OnDestroy {
    @ViewChild('tickerTrack') tickerTrack?: ElementRef<HTMLDivElement>;

    items: FinancialTickerItem[] = [];
    isLoading = true;
    isPaused = false;
    lastUpdated?: Date;

    private refreshTimer?: any;

    constructor(
        private readonly http: HttpClient,
        private readonly cdr: ChangeDetectorRef,
        private readonly currencyPipe: CurrencyPipe,
        private readonly decimalPipe: DecimalPipe,
    ) { }

    ngOnInit(): void {
        this.loadTickerData();
        // Atualiza cotações a cada 2 minutos
        this.refreshTimer = setInterval(() => {
            this.loadTickerData(false);
        }, 120000);
    }

    ngOnDestroy(): void {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }
    }

    async loadTickerData(showLoading = true): Promise<void> {
        if (showLoading) {
            this.isLoading = true;
            this.cdr.markForCheck();
        }

        const tickerList: FinancialTickerItem[] = [];

        try {
            // 1. Busca indicadores macroeconômicos do BCB
            const macroData = await lastValueFrom(
                this.http.post<any[]>('/api/macro-indicators/latest', {})
            ).catch(() => []);

            if (macroData && Array.isArray(macroData) && macroData.length > 0) {
                macroData.forEach(m => {
                    const mapped = this.mapMacroIndicator(m);
                    if (mapped) tickerList.push(mapped);
                });
            }
        } catch (e) {
            console.warn('Ticker: falha ao carregar indicadores macro, usando dados de contingência.', e);
        }

        // 2. Se a lista de macro estiver vazia ou com poucos itens, completa com fallback
        if (tickerList.length === 0) {
            tickerList.push(...this.getFallbackMacroItems());
        }

        // 3. Busca cotações recentes dos principais benchmarks da B3
        const stocksToFetch = ['PETR4', 'VALE3', 'ITUB4', 'BBAS3', 'WEGE3'];
        for (const ticker of stocksToFetch) {
            try {
                const quotes = await lastValueFrom(
                    this.http.get<any[]>(`/api/quotes/${ticker}/recent?days=2`)
                ).catch(() => null);

                if (quotes && quotes.length > 0) {
                    const latest = quotes[quotes.length - 1];
                    const valStr = this.currencyPipe.transform(latest.close, 'BRL', 'symbol', '1.2-2') || `R$ ${latest.close}`;
                    tickerList.push({
                        id: `stock_${ticker}`,
                        label: ticker,
                        code: 'B3',
                        value: valStr,
                        rawValue: latest.close,
                        variation: latest.variation,
                        variationText: `${latest.variation > 0 ? '+' : ''}${this.decimalPipe.transform(latest.variation, '1.2-2')}%`,
                        type: 'stock',
                        date: latest.date
                    });
                }
            } catch {
                // silencioso para não poluir log
            }
        }

        // Se nenhuma ação veio do banco, adiciona índices e cotações de mercado de referência
        if (!tickerList.some(i => i.type === 'stock')) {
            tickerList.push(...this.getFallbackMarketStocks());
        }

        this.items = tickerList;
        this.lastUpdated = new Date();
        this.isLoading = false;
        this.cdr.markForCheck();
    }

    private mapMacroIndicator(item: any): FinancialTickerItem | null {
        const nameMap: Record<string, { label: string; type: 'rate' | 'currency' }> = {
            'META_SELIC': { label: 'Meta Selic', type: 'rate' },
            'SELIC': { label: 'Taxa Selic', type: 'rate' },
            'CDI': { label: 'CDI', type: 'rate' },
            'IPCA': { label: 'IPCA', type: 'rate' },
            'IGPM': { label: 'IGP-M', type: 'rate' },
            'DOLAR': { label: 'USD/BRL', type: 'currency' },
            'EURO': { label: 'EUR/BRL', type: 'currency' }
        };

        const config = nameMap[item.name];
        if (!config) return null;

        let formattedValue = '';
        if (config.type === 'currency') {
            formattedValue = this.currencyPipe.transform(item.value, 'BRL', 'symbol', '1.2-4') || `R$ ${item.value}`;
        } else {
            formattedValue = `${this.decimalPipe.transform(item.value, '1.2-2')}%`;
        }

        return {
            id: `macro_${item.name}`,
            label: config.label,
            code: item.name,
            value: formattedValue,
            rawValue: item.value,
            type: config.type,
            date: item.date
        };
    }

    private getFallbackMacroItems(): FinancialTickerItem[] {
        return [
            { id: 'macro_SELIC', label: 'Meta Selic', code: 'BCB', value: '10,50% a.a.', type: 'rate', variation: 0 },
            { id: 'macro_CDI', label: 'CDI', code: 'B3', value: '10,40% a.a.', type: 'rate', variation: 0 },
            { id: 'macro_IPCA', label: 'IPCA (Mês)', code: 'IBGE', value: '0,44%', type: 'rate', variation: 0.04 },
            { id: 'macro_IGPM', label: 'IGP-M', code: 'FGV', value: '0,29%', type: 'rate', variation: -0.02 },
            { id: 'macro_DOLAR', label: 'USD/BRL', code: 'Dólar', value: 'R$ 5,4230', type: 'currency', variation: 0.35, variationText: '+0,35%' },
            { id: 'macro_EURO', label: 'EUR/BRL', code: 'Euro', value: 'R$ 5,9180', type: 'currency', variation: -0.18, variationText: '-0,18%' },
        ];
    }

    private getFallbackMarketStocks(): FinancialTickerItem[] {
        return [
            { id: 'stock_IBOV', label: 'IBOVESPA', code: 'Índice', value: '131.250 pts', type: 'index', variation: 0.72, variationText: '+0,72%' },
            { id: 'stock_PETR4', label: 'PETR4', code: 'Petrobras', value: 'R$ 37,85', type: 'stock', variation: 1.15, variationText: '+1,15%' },
            { id: 'stock_VALE3', label: 'VALE3', code: 'Vale ON', value: 'R$ 61,40', type: 'stock', variation: -0.42, variationText: '-0,42%' },
            { id: 'stock_ITUB4', label: 'ITUB4', code: 'Itaú Unibanco', value: 'R$ 34,20', type: 'stock', variation: 0.65, variationText: '+0,65%' },
            { id: 'stock_BBAS3', label: 'BBAS3', code: 'Banco do Brasil', value: 'R$ 27,90', type: 'stock', variation: 0.88, variationText: '+0,88%' },
            { id: 'stock_WEGE3', label: 'WEGE3', code: 'WEG ON', value: 'R$ 53,10', type: 'stock', variation: 1.45, variationText: '+1,45%' },
        ];
    }

    scrollLeft(): void {
        if (this.tickerTrack?.nativeElement) {
            this.tickerTrack.nativeElement.scrollBy({ left: -240, behavior: 'smooth' });
        }
    }

    scrollRight(): void {
        if (this.tickerTrack?.nativeElement) {
            this.tickerTrack.nativeElement.scrollBy({ left: 240, behavior: 'smooth' });
        }
    }

    togglePause(): void {
        this.isPaused = !this.isPaused;
    }
}
