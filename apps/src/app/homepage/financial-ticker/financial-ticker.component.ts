import { Component, OnInit, OnDestroy, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
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
    extractedAt?: string;
    source?: string;
    tooltip?: string;
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

    private refreshTimer?: ReturnType<typeof setInterval>;

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
            // 1. Busca indicadores macroeconômicos (BCB + Câmbio em tempo real)
            const macroData = await lastValueFrom(
                this.http.post<any[]>('/api/macro-indicators/latest', {})
            ).catch(() => []);

            if (macroData && Array.isArray(macroData) && macroData.length > 0) {
                const order = ['META_SELIC', 'SELIC', 'CDI', 'IPCA', 'IGPM', 'POUPANCA', 'DOLAR', 'EURO'];
                const sorted = [...macroData].sort((a, b) => {
                    const idxA = order.indexOf(a.name);
                    const idxB = order.indexOf(b.name);
                    return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
                });

                sorted.forEach(m => {
                    const mapped = this.mapMacroIndicator(m);
                    if (mapped) tickerList.push(mapped);
                });
            }
        } catch (e) {
            console.warn('Ticker: falha ao carregar indicadores macro, usando dados de contingência.', e);
        }

        // 2. Se a lista de macro estiver vazia, completa com fallback
        if (tickerList.length === 0) {
            tickerList.push(...this.getFallbackMacroItems());
        }

        // 3. Busca cotações recentes do índice IBOVESPA e principais ações da B3 em paralelo
        const assetsToFetch = ['IBOV', 'PETR4', 'VALE3', 'ITUB4', 'BBAS3', 'WEGE3'];
        const quoteResults = await Promise.all(
            assetsToFetch.map(async ticker => {
                try {
                    const quotes = await lastValueFrom(
                        this.http.get<any[]>(`/api/quotes/${ticker}/recent?days=2`)
                    ).catch(() => null);
                    return { ticker, quotes };
                } catch {
                    return { ticker, quotes: null };
                }
            })
        );

        for (const { ticker, quotes } of quoteResults) {
            if (!quotes || quotes.length === 0) continue;

            // O endpoint /recent retorna ordenado por data DESC: índice [0] é a cotação mais recente
            const latest = quotes[0];
            const isIndex = ticker === 'IBOV';
            const valStr = isIndex
                ? `${this.decimalPipe.transform(latest.close, '1.0-0') || latest.close} pts`
                : (this.currencyPipe.transform(latest.close, 'BRL', 'symbol', '1.2-2') || `R$ ${latest.close}`);

            const variation = latest.variation !== undefined && latest.variation !== null
                ? Number(latest.variation)
                : undefined;

            const item: FinancialTickerItem = {
                id: `stock_${ticker}`,
                label: isIndex ? 'IBOVESPA' : ticker,
                code: 'B3',
                value: valStr,
                rawValue: Number(latest.close),
                variation,
                variationText: variation !== undefined
                    ? `${variation > 0 ? '+' : ''}${this.decimalPipe.transform(variation, '1.2-2')}%`
                    : undefined,
                type: isIndex ? 'index' : 'stock',
                date: latest.date,
                extractedAt: latest.extractedAt,
                source: latest.source || 'Yahoo Finance (v8)',
            };
            item.tooltip = this.buildItemTooltip(item);
            tickerList.push(item);
        }

        // Se nenhuma ação/índice veio do banco, adiciona referências de mercado
        if (!tickerList.some(i => i.type === 'stock' || i.type === 'index')) {
            tickerList.push(...this.getFallbackMarketStocks());
        }

        this.items = tickerList;
        this.lastUpdated = new Date();
        this.isLoading = false;
        this.cdr.markForCheck();
    }

    getItemTooltip(item: FinancialTickerItem): string {
        return item.tooltip || this.buildItemTooltip(item);
    }

    private buildItemTooltip(item: FinancialTickerItem): string {
        const parts: string[] = [];
        const extractedText = this.formatExtractedAt(item.extractedAt);
        if (extractedText) {
            parts.push(`Extraído em: ${extractedText}`);
        } else if (this.lastUpdated) {
            parts.push(`Consultado em: ${this.formatExtractedAt(this.lastUpdated.toISOString())}`);
        }

        const refDate = this.formatReferenceDate(item.date);
        if (refDate) {
            parts.push(`Ref.: ${refDate}`);
        }

        if (item.source) {
            parts.push(`Fonte: ${item.source}`);
        }

        return parts.join(' | ');
    }

    private formatExtractedAt(value?: string): string {
        if (!value) return '';
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return '';

        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        }).format(parsed);
    }

    private formatReferenceDate(value?: string): string {
        if (!value) return '';
        const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (match) {
            return `${match[3]}/${match[2]}/${match[1]}`;
        }
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return '';
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }).format(parsed);
    }

    private mapMacroIndicator(item: any): FinancialTickerItem | null {
        const nameMap: Record<string, { label: string; type: 'rate' | 'currency'; suffix?: string }> = {
            'META_SELIC': { label: 'Meta Selic', type: 'rate', suffix: '% a.a.' },
            'SELIC': { label: 'Taxa Selic', type: 'rate', suffix: '% a.a.' },
            'CDI': { label: 'CDI', type: 'rate', suffix: '% a.a.' },
            'IPCA': { label: 'IPCA (Mês)', type: 'rate', suffix: '%' },
            'IGPM': { label: 'IGP-M', type: 'rate', suffix: '%' },
            'POUPANCA': { label: 'Poupança', type: 'rate', suffix: '%' },
            'DOLAR': { label: 'USD/BRL', type: 'currency' },
            'EURO': { label: 'EUR/BRL', type: 'currency' }
        };

        const config = nameMap[item.name];
        if (!config) return null;

        const numericValue = Number(item.value);
        let formattedValue = '';
        if (config.type === 'currency') {
            formattedValue = this.currencyPipe.transform(numericValue, 'BRL', 'symbol', '1.2-4') || `R$ ${numericValue}`;
        } else {
            formattedValue = `${this.decimalPipe.transform(numericValue, '1.2-2')}${config.suffix || '%'}`;
        }

        const hasVariation = item.variation !== null && item.variation !== undefined && !Number.isNaN(Number(item.variation));
        const variation = hasVariation ? Number(item.variation) : undefined;
        const variationUnit = config.type === 'currency' ? '%' : ' p.p.';
        const variationText = variation !== undefined
            ? `${variation > 0 ? '+' : ''}${this.decimalPipe.transform(variation, '1.2-2')}${variationUnit}`
            : undefined;

        const mapped: FinancialTickerItem = {
            id: `macro_${item.name}`,
            label: config.label,
            code: item.name,
            value: formattedValue,
            rawValue: numericValue,
            variation,
            variationText,
            type: config.type,
            date: item.date,
            extractedAt: item.extractedAt,
            source: item.source,
        };
        mapped.tooltip = this.buildItemTooltip(mapped);
        return mapped;
    }

    private getFallbackMacroItems(): FinancialTickerItem[] {
        const nowIso = new Date().toISOString();
        const items: FinancialTickerItem[] = [
            { id: 'macro_SELIC', label: 'Meta Selic', code: 'BCB', value: '13,75% a.a.', type: 'rate', variation: 0, extractedAt: nowIso, source: 'Contingência local' },
            { id: 'macro_CDI', label: 'CDI', code: 'B3', value: '13,65% a.a.', type: 'rate', variation: 0, extractedAt: nowIso, source: 'Contingência local' },
            { id: 'macro_IPCA', label: 'IPCA (Mês)', code: 'IBGE', value: '0,44%', type: 'rate', variation: 0.04, extractedAt: nowIso, source: 'Contingência local' },
            { id: 'macro_IGPM', label: 'IGP-M', code: 'FGV', value: '0,29%', type: 'rate', variation: -0.02, extractedAt: nowIso, source: 'Contingência local' },
            { id: 'macro_DOLAR', label: 'USD/BRL', code: 'Dólar', value: 'R$ 5,9488', type: 'currency', variation: 0.22, variationText: '+0,22%', extractedAt: nowIso, source: 'Contingência local' },
            { id: 'macro_EURO', label: 'EUR/BRL', code: 'Euro', value: 'R$ 6,5192', type: 'currency', variation: 0.14, variationText: '+0,14%', extractedAt: nowIso, source: 'Contingência local' },
        ];
        items.forEach(item => { item.tooltip = this.buildItemTooltip(item); });
        return items;
    }

    private getFallbackMarketStocks(): FinancialTickerItem[] {
        const nowIso = new Date().toISOString();
        const items: FinancialTickerItem[] = [
            { id: 'stock_IBOV', label: 'IBOVESPA', code: 'Índice', value: '166.376 pts', type: 'index', variation: -0.69, variationText: '-0,69%', extractedAt: nowIso, source: 'Contingência local' },
            { id: 'stock_PETR4', label: 'PETR4', code: 'Petrobras', value: 'R$ 42,67', type: 'stock', variation: -1.16, variationText: '-1,16%', extractedAt: nowIso, source: 'Contingência local' },
            { id: 'stock_VALE3', label: 'VALE3', code: 'Vale ON', value: 'R$ 58,48', type: 'stock', variation: -0.42, variationText: '-0,42%', extractedAt: nowIso, source: 'Contingência local' },
            { id: 'stock_ITUB4', label: 'ITUB4', code: 'Itaú Unibanco', value: 'R$ 40,07', type: 'stock', variation: 0.65, variationText: '+0,65%', extractedAt: nowIso, source: 'Contingência local' },
            { id: 'stock_BBAS3', label: 'BBAS3', code: 'Banco do Brasil', value: 'R$ 14,30', type: 'stock', variation: 0.88, variationText: '+0,88%', extractedAt: nowIso, source: 'Contingência local' },
            { id: 'stock_WEGE3', label: 'WEGE3', code: 'WEG ON', value: 'R$ 51,13', type: 'stock', variation: 1.45, variationText: '+1,45%', extractedAt: nowIso, source: 'Contingência local' },
        ];
        items.forEach(item => { item.tooltip = this.buildItemTooltip(item); });
        return items;
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
