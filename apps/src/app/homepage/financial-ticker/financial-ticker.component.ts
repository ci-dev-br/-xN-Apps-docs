import { Component, OnInit, OnDestroy, ChangeDetectorRef, ElementRef, ViewChild, Optional } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { lastValueFrom } from 'rxjs';
import {
    TickerWatchlistDialogComponent,
    TickerWatchlistDialogResult,
    WatchlistOption,
} from './ticker-watchlist-dialog.component';

export interface FinancialTickerItem {
    id: string;
    key: string;
    label: string;
    code?: string;
    value: string;
    rawValue?: number;
    variation?: number;
    variationText?: string;
    type: 'rate' | 'currency' | 'stock' | 'index' | 'crypto';
    date?: string;
    extractedAt?: string;
    queriedAt?: string;
    source?: string;
    tooltip?: string;
}

const WATCHLIST_STORAGE_KEY = 'ci_financial_ticker_watchlist_v1';

const BASE_WATCHLIST_OPTIONS: WatchlistOption[] = [
    // Macro & Taxas (BCB)
    { key: 'META_SELIC', label: 'Meta Selic', subtitle: 'BCB COPOM', category: 'macro' },
    { key: 'SELIC', label: 'Taxa Selic', subtitle: 'BCB 1178', category: 'macro' },
    { key: 'CDI', label: 'CDI', subtitle: 'BCB 4389', category: 'macro' },
    { key: 'IPCA', label: 'IPCA (Mês)', subtitle: 'IBGE', category: 'macro' },
    { key: 'IGPM', label: 'IGP-M', subtitle: 'FGV', category: 'macro' },
    { key: 'POUPANCA', label: 'Poupança', subtitle: 'BCB 195', category: 'macro' },

    // Câmbio
    { key: 'DOLAR', label: 'USD/BRL', subtitle: 'Dólar Comercial', category: 'currency' },
    { key: 'EURO', label: 'EUR/BRL', subtitle: 'Euro Comercial', category: 'currency' },

    // B3 & Ações
    { key: 'IBOV', label: 'IBOVESPA', subtitle: 'Índice B3', category: 'b3' },
    { key: 'PETR4', label: 'PETR4', subtitle: 'Petrobras PN', category: 'b3' },
    { key: 'VALE3', label: 'VALE3', subtitle: 'Vale ON', category: 'b3' },
    { key: 'ITUB4', label: 'ITUB4', subtitle: 'Itaú Unibanco', category: 'b3' },
    { key: 'BBAS3', label: 'BBAS3', subtitle: 'Banco do Brasil', category: 'b3' },
    { key: 'WEGE3', label: 'WEGE3', subtitle: 'WEG ON', category: 'b3' },

    // Cripto & Índices Cripto
    { key: 'BTC', label: 'Bitcoin (BTC)', subtitle: 'BRL', category: 'crypto' },
    { key: 'ETH', label: 'Ethereum (ETH)', subtitle: 'BRL', category: 'crypto' },
    { key: 'SOL', label: 'Solana (SOL)', subtitle: 'BRL', category: 'crypto' },
    { key: 'BNB', label: 'BNB', subtitle: 'BRL', category: 'crypto' },
    { key: 'XRP', label: 'XRP', subtitle: 'BRL', category: 'crypto' },
    { key: 'ADA', label: 'Cardano (ADA)', subtitle: 'BRL', category: 'crypto' },
    { key: 'DOGE', label: 'Dogecoin (DOGE)', subtitle: 'BRL', category: 'crypto' },
    { key: 'CRYPTO_FEAR_GREED', label: 'Medo & Ganância Cripto', subtitle: 'Alternative.me', category: 'crypto' },
    { key: 'BTC_DOMINANCE', label: 'Dominância BTC', subtitle: 'CoinGecko Global', category: 'crypto' },
    { key: 'CRYPTO_MCAP', label: 'Market Cap Cripto', subtitle: 'CoinGecko Global', category: 'crypto' },
];

const DEFAULT_WATCHLIST_KEYS: string[] = [
    'META_SELIC',
    'SELIC',
    'CDI',
    'IPCA',
    'IGPM',
    'DOLAR',
    'EURO',
    'IBOV',
    'PETR4',
    'VALE3',
    'ITUB4',
    'BBAS3',
    'WEGE3',
    'BTC',
    'ETH',
    'SOL',
    'CRYPTO_FEAR_GREED',
    'BTC_DOMINANCE',
    'CRYPTO_MCAP',
];

@Component({
    selector: 'ci-financial-ticker',
    standalone: true,
    imports: [
        CommonModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        MatDialogModule,
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

    selectedKeys: string[] = [...DEFAULT_WATCHLIST_KEYS];
    customB3Tickers: string[] = [];

    private refreshTimer?: ReturnType<typeof setInterval>;

    constructor(
        private readonly http: HttpClient,
        private readonly cdr: ChangeDetectorRef,
        private readonly currencyPipe: CurrencyPipe,
        private readonly decimalPipe: DecimalPipe,
        @Optional() private readonly dialog?: MatDialog,
    ) {
        this.loadWatchlistFromStorage();
    }

    ngOnInit(): void {
        this.loadTickerData();
        // Atualiza cotações e índices a cada 2 minutos
        this.refreshTimer = setInterval(() => {
            this.loadTickerData(false);
        }, 120000);
    }

    ngOnDestroy(): void {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }
    }

    get selectedCount(): number {
        return this.selectedKeys.length;
    }

    openWatchlistDialog(): void {
        if (!this.dialog) return;

        const allOptions: WatchlistOption[] = [
            ...BASE_WATCHLIST_OPTIONS,
            ...this.customB3Tickers
                .filter(t => !BASE_WATCHLIST_OPTIONS.some(o => o.key === t))
                .map(t => ({
                    key: t,
                    label: t,
                    subtitle: 'B3 Personalizado',
                    category: 'b3' as const,
                    isCustom: true,
                })),
        ];

        const ref = this.dialog.open<TickerWatchlistDialogComponent, any, TickerWatchlistDialogResult>(
            TickerWatchlistDialogComponent,
            {
                width: '680px',
                maxWidth: '95vw',
                data: {
                    options: allOptions,
                    selectedKeys: [...this.selectedKeys],
                    defaultKeys: [...DEFAULT_WATCHLIST_KEYS],
                },
            }
        );

        ref.afterClosed().subscribe(result => {
            if (!result) return;
            this.selectedKeys = result.selectedKeys.length > 0 ? result.selectedKeys : [...DEFAULT_WATCHLIST_KEYS];
            this.customB3Tickers = result.customB3Tickers || [];
            this.saveWatchlistToStorage();
            this.loadTickerData(true);
        });
    }

    async loadTickerData(showLoading = true): Promise<void> {
        if (showLoading) {
            this.isLoading = true;
            this.cdr.markForCheck();
        }

        const queryTimestamp = new Date();
        const queryTimestampIso = queryTimestamp.toISOString();
        const selectedSet = new Set(this.selectedKeys);

        const knownB3Tickers = new Set([
            ...BASE_WATCHLIST_OPTIONS.filter(o => o.category === 'b3').map(o => o.key),
            ...this.customB3Tickers,
        ]);
        const knownCryptoKeys = new Set(
            BASE_WATCHLIST_OPTIONS.filter(o => o.category === 'crypto').map(o => o.key)
        );
        const knownMacroKeys = new Set(
            BASE_WATCHLIST_OPTIONS.filter(o => o.category === 'macro' || o.category === 'currency').map(o => o.key)
        );

        const wantsMacro = this.selectedKeys.some(k => knownMacroKeys.has(k));
        const wantsCrypto = this.selectedKeys.some(k => knownCryptoKeys.has(k));
        const b3ToFetch = this.selectedKeys.filter(k => knownB3Tickers.has(k));

        const itemsByKey = new Map<string, FinancialTickerItem>();

        try {
            const [macroData, cryptoData] = await Promise.all([
                wantsMacro
                    ? lastValueFrom(this.http.post<any[]>('/api/macro-indicators/latest', {})).catch(() => [])
                    : Promise.resolve([]),
                wantsCrypto
                    ? lastValueFrom(this.http.post<any[]>('/api/macro-indicators/crypto', {})).catch(() => [])
                    : Promise.resolve([]),
            ]);

            if (Array.isArray(macroData) && macroData.length > 0) {
                for (const m of macroData) {
                    if (!selectedSet.has(m.name)) continue;
                    const mapped = this.mapMacroOrCryptoIndicator(m, queryTimestampIso);
                    if (mapped) itemsByKey.set(mapped.key, mapped);
                }
            }

            if (wantsMacro && !Array.from(itemsByKey.keys()).some(k => knownMacroKeys.has(k))) {
                for (const fb of this.getFallbackMacroItems(queryTimestampIso)) {
                    if (selectedSet.has(fb.key)) itemsByKey.set(fb.key, fb);
                }
            }

            if (Array.isArray(cryptoData) && cryptoData.length > 0) {
                for (const c of cryptoData) {
                    if (!selectedSet.has(c.name)) continue;
                    const mapped = this.mapMacroOrCryptoIndicator(c, queryTimestampIso);
                    if (mapped) itemsByKey.set(mapped.key, mapped);
                }
            }

            if (wantsCrypto && !Array.from(itemsByKey.keys()).some(k => knownCryptoKeys.has(k))) {
                for (const fb of this.getFallbackCryptoItems(queryTimestampIso)) {
                    if (selectedSet.has(fb.key)) itemsByKey.set(fb.key, fb);
                }
            }
        } catch (e) {
            console.warn('Ticker: falha ao carregar indicadores macro/cripto, usando contingência.', e);
        }

        // Busca cotações B3 selecionadas em paralelo
        if (b3ToFetch.length > 0) {
            const quoteResults = await Promise.all(
                b3ToFetch.map(async ticker => {
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

            let anyB3Loaded = false;
            for (const { ticker, quotes } of quoteResults) {
                if (!quotes || quotes.length === 0) continue;
                anyB3Loaded = true;

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
                    key: ticker,
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
                    extractedAt: latest.extractedAt || undefined,
                    queriedAt: latest.queriedAt || queryTimestampIso,
                    source: latest.source || 'Yahoo Finance (v8)',
                };
                item.tooltip = this.buildItemTooltip(item);
                itemsByKey.set(item.key, item);
            }

            if (!anyB3Loaded) {
                for (const fb of this.getFallbackMarketStocks(queryTimestampIso)) {
                    if (selectedSet.has(fb.key)) itemsByKey.set(fb.key, fb);
                }
            }
        }

        // Mantém a ordem escolhida pelo usuário
        const orderedItems: FinancialTickerItem[] = [];
        for (const key of this.selectedKeys) {
            const found = itemsByKey.get(key);
            if (found) orderedItems.push(found);
        }

        this.items = orderedItems;
        this.lastUpdated = queryTimestamp;
        this.isLoading = false;
        this.cdr.markForCheck();
    }

    getBadgeTooltip(): string {
        const queriedText = this.lastUpdated
            ? this.formatDateTime(this.lastUpdated.toISOString())
            : '--';
        return `Última consulta na base: ${queriedText} | Passe o mouse sobre um índice para distinguir a data de extração na fonte e a da consulta na base`;
    }

    getItemTooltip(item: FinancialTickerItem): string {
        return item.tooltip || this.buildItemTooltip(item);
    }

    private buildItemTooltip(item: FinancialTickerItem): string {
        const parts: string[] = [];
        const extractedText = this.formatDateTime(item.extractedAt);
        parts.push(
            extractedText
                ? `Extração na fonte: ${extractedText}`
                : 'Extração na fonte: indisponível (contingência)'
        );

        const queriedText = this.formatDateTime(item.queriedAt || this.lastUpdated?.toISOString());
        if (queriedText) {
            parts.push(`Consulta na base: ${queriedText}`);
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

    private formatDateTime(value?: string): string {
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

    private mapMacroOrCryptoIndicator(item: any, fallbackQueryIso: string): FinancialTickerItem | null {
        const nameMap: Record<string, { label: string; code?: string; type: FinancialTickerItem['type']; suffix?: string }> = {
            'META_SELIC': { label: 'Meta Selic', code: 'BCB', type: 'rate', suffix: '% a.a.' },
            'SELIC': { label: 'Taxa Selic', code: 'BCB', type: 'rate', suffix: '% a.a.' },
            'CDI': { label: 'CDI', code: 'BCB', type: 'rate', suffix: '% a.a.' },
            'IPCA': { label: 'IPCA (Mês)', code: 'IBGE', type: 'rate', suffix: '%' },
            'IGPM': { label: 'IGP-M', code: 'FGV', type: 'rate', suffix: '%' },
            'POUPANCA': { label: 'Poupança', code: 'BCB', type: 'rate', suffix: '%' },
            'DOLAR': { label: 'USD/BRL', code: 'CÂMBIO', type: 'currency' },
            'EURO': { label: 'EUR/BRL', code: 'CÂMBIO', type: 'currency' },
            'BTC': { label: 'BTC', code: 'CRIPTO', type: 'crypto' },
            'ETH': { label: 'ETH', code: 'CRIPTO', type: 'crypto' },
            'SOL': { label: 'SOL', code: 'CRIPTO', type: 'crypto' },
            'BNB': { label: 'BNB', code: 'CRIPTO', type: 'crypto' },
            'XRP': { label: 'XRP', code: 'CRIPTO', type: 'crypto' },
            'ADA': { label: 'ADA', code: 'CRIPTO', type: 'crypto' },
            'DOGE': { label: 'DOGE', code: 'CRIPTO', type: 'crypto' },
            'CRYPTO_FEAR_GREED': { label: 'Medo & Ganância', code: 'CRIPTO', type: 'crypto' },
            'BTC_DOMINANCE': { label: 'Dom. BTC', code: 'CRIPTO', type: 'crypto' },
            'CRYPTO_MCAP': { label: 'MCap Cripto', code: 'CRIPTO', type: 'crypto' },
        };

        const config = nameMap[item.name];
        if (!config) return null;

        const numericValue = Number(item.value);
        let formattedValue = '';

        if (item.name === 'CRYPTO_FEAR_GREED') {
            formattedValue = `${Math.round(numericValue)} pts`;
        } else if (item.name === 'BTC_DOMINANCE') {
            formattedValue = `${this.decimalPipe.transform(numericValue, '1.2-2')}%`;
        } else if (item.name === 'CRYPTO_MCAP') {
            formattedValue = `US$ ${this.decimalPipe.transform(numericValue, '1.2-2')} tri`;
        } else if (config.type === 'currency' || config.type === 'crypto') {
            const digits = numericValue < 10 ? '1.2-4' : '1.2-2';
            formattedValue = this.currencyPipe.transform(numericValue, 'BRL', 'symbol', digits) || `R$ ${numericValue}`;
        } else {
            formattedValue = `${this.decimalPipe.transform(numericValue, '1.2-2')}${config.suffix || '%'}`;
        }

        const hasVariation = item.variation !== null && item.variation !== undefined && !Number.isNaN(Number(item.variation));
        const variation = hasVariation ? Number(item.variation) : undefined;
        let variationUnit = '%';
        if (config.type === 'rate') variationUnit = ' p.p.';
        if (item.name === 'CRYPTO_FEAR_GREED') variationUnit = ' pts';

        const variationText = variation !== undefined
            ? `${variation > 0 ? '+' : ''}${this.decimalPipe.transform(variation, item.name === 'CRYPTO_FEAR_GREED' ? '1.0-0' : '1.2-2')}${variationUnit}`
            : undefined;

        const mapped: FinancialTickerItem = {
            id: `${config.type}_${item.name}`,
            key: item.name,
            label: config.label,
            code: config.code || item.name,
            value: formattedValue,
            rawValue: numericValue,
            variation,
            variationText,
            type: config.type,
            date: item.date,
            extractedAt: item.extractedAt || undefined,
            queriedAt: item.queriedAt || fallbackQueryIso,
            source: item.source,
        };
        mapped.tooltip = this.buildItemTooltip(mapped);
        return mapped;
    }

    private getFallbackMacroItems(queriedAt: string): FinancialTickerItem[] {
        const items: FinancialTickerItem[] = [
            { id: 'macro_META_SELIC', key: 'META_SELIC', label: 'Meta Selic', code: 'BCB', value: '13,75% a.a.', type: 'rate', variation: 0, queriedAt, source: 'Contingência local' },
            { id: 'macro_SELIC', key: 'SELIC', label: 'Taxa Selic', code: 'BCB', value: '13,65% a.a.', type: 'rate', variation: 0, queriedAt, source: 'Contingência local' },
            { id: 'macro_CDI', key: 'CDI', label: 'CDI', code: 'BCB', value: '13,65% a.a.', type: 'rate', variation: 0, queriedAt, source: 'Contingência local' },
            { id: 'macro_IPCA', key: 'IPCA', label: 'IPCA (Mês)', code: 'IBGE', value: '0,14%', type: 'rate', variation: -0.68, queriedAt, source: 'Contingência local' },
            { id: 'macro_IGPM', key: 'IGPM', label: 'IGP-M', code: 'FGV', value: '1,47%', type: 'rate', variation: -0.10, queriedAt, source: 'Contingência local' },
            { id: 'macro_DOLAR', key: 'DOLAR', label: 'USD/BRL', code: 'CÂMBIO', value: 'R$ 5,9488', type: 'currency', variation: 0.22, variationText: '+0,22%', queriedAt, source: 'Contingência local' },
            { id: 'macro_EURO', key: 'EURO', label: 'EUR/BRL', code: 'CÂMBIO', value: 'R$ 6,5192', type: 'currency', variation: 0.14, variationText: '+0,14%', queriedAt, source: 'Contingência local' },
        ];
        items.forEach(item => { item.tooltip = this.buildItemTooltip(item); });
        return items;
    }

    private getFallbackMarketStocks(queriedAt: string): FinancialTickerItem[] {
        const items: FinancialTickerItem[] = [
            { id: 'stock_IBOV', key: 'IBOV', label: 'IBOVESPA', code: 'B3', value: '166.376 pts', type: 'index', variation: -0.69, variationText: '-0,69%', queriedAt, source: 'Contingência local' },
            { id: 'stock_PETR4', key: 'PETR4', label: 'PETR4', code: 'B3', value: 'R$ 42,67', type: 'stock', variation: -1.16, variationText: '-1,16%', queriedAt, source: 'Contingência local' },
            { id: 'stock_VALE3', key: 'VALE3', label: 'VALE3', code: 'B3', value: 'R$ 58,48', type: 'stock', variation: -0.42, variationText: '-0,42%', queriedAt, source: 'Contingência local' },
            { id: 'stock_ITUB4', key: 'ITUB4', label: 'ITUB4', code: 'B3', value: 'R$ 40,07', type: 'stock', variation: 0.65, variationText: '+0,65%', queriedAt, source: 'Contingência local' },
            { id: 'stock_BBAS3', key: 'BBAS3', label: 'BBAS3', code: 'B3', value: 'R$ 14,30', type: 'stock', variation: 0.88, variationText: '+0,88%', queriedAt, source: 'Contingência local' },
            { id: 'stock_WEGE3', key: 'WEGE3', label: 'WEGE3', code: 'B3', value: 'R$ 51,13', type: 'stock', variation: 1.45, variationText: '+1,45%', queriedAt, source: 'Contingência local' },
        ];
        items.forEach(item => { item.tooltip = this.buildItemTooltip(item); });
        return items;
    }

    private getFallbackCryptoItems(queriedAt: string): FinancialTickerItem[] {
        const items: FinancialTickerItem[] = [
            { id: 'crypto_BTC', key: 'BTC', label: 'BTC', code: 'CRIPTO', value: 'R$ 346.112,00', type: 'crypto', variation: -4.92, variationText: '-4,92%', queriedAt, source: 'Contingência local' },
            { id: 'crypto_ETH', key: 'ETH', label: 'ETH', code: 'CRIPTO', value: 'R$ 9.723,25', type: 'crypto', variation: -5.52, variationText: '-5,52%', queriedAt, source: 'Contingência local' },
            { id: 'crypto_SOL', key: 'SOL', label: 'SOL', code: 'CRIPTO', value: 'R$ 403,73', type: 'crypto', variation: -5.54, variationText: '-5,54%', queriedAt, source: 'Contingência local' },
            { id: 'crypto_CRYPTO_FEAR_GREED', key: 'CRYPTO_FEAR_GREED', label: 'Medo & Ganância', code: 'CRIPTO', value: '12 pts', type: 'crypto', variation: 0, variationText: '0 pts', queriedAt, source: 'Contingência local' },
            { id: 'crypto_BTC_DOMINANCE', key: 'BTC_DOMINANCE', label: 'Dom. BTC', code: 'CRIPTO', value: '57,61%', type: 'crypto', queriedAt, source: 'Contingência local' },
            { id: 'crypto_CRYPTO_MCAP', key: 'CRYPTO_MCAP', label: 'MCap Cripto', code: 'CRIPTO', value: 'US$ 2,02 tri', type: 'crypto', variation: -8.16, variationText: '-8,16%', queriedAt, source: 'Contingência local' },
        ];
        items.forEach(item => { item.tooltip = this.buildItemTooltip(item); });
        return items;
    }

    private loadWatchlistFromStorage(): void {
        try {
            if (typeof localStorage === 'undefined') return;
            const raw = localStorage.getItem(WATCHLIST_STORAGE_KEY);
            if (!raw) return;

            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed?.selectedKeys) && parsed.selectedKeys.length > 0) {
                this.selectedKeys = parsed.selectedKeys.filter((k: unknown) => typeof k === 'string');
            }
            if (Array.isArray(parsed?.customB3Tickers)) {
                this.customB3Tickers = parsed.customB3Tickers.filter((k: unknown) => typeof k === 'string');
            }
        } catch {
            // mantém padrão em caso de JSON inválido
        }
    }

    private saveWatchlistToStorage(): void {
        try {
            if (typeof localStorage === 'undefined') return;
            localStorage.setItem(
                WATCHLIST_STORAGE_KEY,
                JSON.stringify({
                    selectedKeys: this.selectedKeys,
                    customB3Tickers: this.customB3Tickers,
                })
            );
        } catch {
            // silencioso
        }
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
