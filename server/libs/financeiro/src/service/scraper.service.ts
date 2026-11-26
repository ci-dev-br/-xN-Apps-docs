import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyQuote } from '../model/daily-quote.entity';
import { Asset } from '../model/asset.entity';

interface ParsedQuoteBar {
    dateStr: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    source: string;
    extractedAt: Date;
}

@Injectable()
export class ScraperService implements OnModuleInit {
    private readonly logger = new Logger(ScraperService.name);

    private readonly QUOTE_TTL_MS = 5 * 60 * 1000; // 5 minutos
    private readonly REQUEST_TIMEOUT_MS = 8000;
    private readonly ON_DEMAND_WAIT_MS = 5000;

    private bulkSyncPromise: Promise<void> | null = null;
    private readonly tickerSyncPromises = new Map<string, Promise<void>>();
    private readonly lastTickerSyncAt = new Map<string, number>();

    private readonly DEFAULT_ASSETS: Array<{ ticker: string; type: string }> = [
        { ticker: 'IBOV', type: 'INDICE' },
        { ticker: 'PETR4', type: 'PN' },
        { ticker: 'VALE3', type: 'ON' },
        { ticker: 'ITUB4', type: 'PN' },
        { ticker: 'BBAS3', type: 'ON' },
        { ticker: 'WEGE3', type: 'ON' },
    ];

    constructor(
        @InjectRepository(Asset)
        private readonly assetRepository: Repository<Asset>,
        @InjectRepository(DailyQuote)
        private readonly quoteRepository: Repository<DailyQuote>,
    ) { }

    async onModuleInit() {
        await this.ensureDefaultAssets();

        const quoteCount = await this.quoteRepository.count();
        if (quoteCount === 0) {
            this.logger.warn('Tabela de cotações vazia! Iniciando coleta inicial...');
            this.fetchDailyQuotes(true).catch(err =>
                this.logger.warn(`Falha na coleta inicial de cotações: ${err.message}`),
            );
        } else {
            this.fetchDailyQuotes(true).catch(err =>
                this.logger.warn(`Falha na atualização inicial de cotações em background: ${err.message}`),
            );
        }
    }

    private async ensureDefaultAssets(): Promise<void> {
        for (const def of this.DEFAULT_ASSETS) {
            const exists = await this.assetRepository.findOne({ where: { ticker: def.ticker } });
            if (!exists) {
                const asset = this.assetRepository.create({
                    ticker: def.ticker,
                    type: def.type,
                });
                await this.assetRepository.save(asset);
                this.logger.log(`Ativo padrão cadastrado: ${def.ticker} (${def.type})`);
            }
        }
    }

    /**
     * Garante que o ativo possua cotações recentes antes de responder requisições.
     */
    async ensureFreshQuote(rawTicker: string): Promise<void> {
        const ticker = rawTicker.trim().toUpperCase();
        let asset = await this.assetRepository.findOne({ where: { ticker } });

        if (!asset && this.isSupportedB3Ticker(ticker)) {
            asset = await this.assetRepository.save(
                this.assetRepository.create({
                    ticker,
                    type: ticker === 'IBOV' ? 'INDICE' : 'ACAO',
                }),
            );
        }

        if (!asset) return;

        const recentQuotes = await this.quoteRepository.find({
            where: { asset: { id: asset.id } },
            order: { date: 'DESC' },
            take: 2,
        });

        const latest = recentQuotes[0];
        const now = Date.now();
        const isMissingOrStale =
            recentQuotes.length < 2 ||
            !latest?.extractedAt ||
            now - new Date(latest.extractedAt).getTime() > this.QUOTE_TTL_MS;

        if (!isMissingOrStale) return;

        const lastAttempt = this.lastTickerSyncAt.get(ticker) || 0;
        if (now - lastAttempt < 60_000) return;

        await Promise.race([
            this.fetchQuoteForAsset(asset),
            new Promise<void>(resolve => setTimeout(resolve, this.ON_DEMAND_WAIT_MS)),
        ]);
    }

    /**
     * Atualiza cotações a cada 5 minutos durante o pregão da B3 (Seg-Sex, 09h-19h).
     */
    @Cron('*/5 9-19 * * 1-5')
    async fetchDailyQuotes(force = false): Promise<void> {
        if (this.bulkSyncPromise) return this.bulkSyncPromise;

        this.bulkSyncPromise = (async () => {
            this.logger.log('Iniciando coleta de cotações B3 (Yahoo Finance v8)...');
            await this.ensureDefaultAssets();

            const assets = await this.assetRepository.find();
            if (assets.length === 0) {
                this.logger.warn('Nenhum ativo cadastrado para buscar cotações.');
                return;
            }

            await Promise.allSettled(
                assets.map(asset => this.fetchQuoteForAsset(asset, force)),
            );

            this.logger.log('Coleta de cotações B3 finalizada.');
        })().finally(() => {
            this.bulkSyncPromise = null;
        });

        return this.bulkSyncPromise;
    }

    /**
     * Consolidação diária após o fechamento da B3 às 20:00 (Seg-Sex).
     */
    @Cron('0 20 * * 1-5')
    async fetchClosingQuotes(): Promise<void> {
        await this.fetchDailyQuotes(true);
    }

    async fetchQuoteForAsset(asset: Asset, force = false): Promise<void> {
        const ticker = asset.ticker.toUpperCase();
        const existingPromise = this.tickerSyncPromises.get(ticker);
        if (existingPromise) return existingPromise;

        const now = Date.now();
        if (!force && now - (this.lastTickerSyncAt.get(ticker) || 0) < 60_000) {
            return;
        }

        const task = (async () => {
            this.lastTickerSyncAt.set(ticker, Date.now());
            try {
                let bars = await this.fetchFromYahooChart(ticker);

                if (bars.length === 0 && process.env.BRAPI_TOKEN) {
                    bars = await this.fetchFromBrapi(ticker, process.env.BRAPI_TOKEN);
                }

                if (bars.length === 0) {
                    this.logger.warn(`Nenhuma cotação retornada para ${ticker}.`);
                    return;
                }

                await this.upsertQuotes(asset, bars);
            } catch (error) {
                this.logger.error(`Erro ao buscar cotação de ${ticker}: ${error.message}`);
            }
        })().finally(() => {
            this.tickerSyncPromises.delete(ticker);
        });

        this.tickerSyncPromises.set(ticker, task);
        return task;
    }

    private async fetchFromYahooChart(ticker: string): Promise<ParsedQuoteBar[]> {
        const yahooSymbol = this.toYahooSymbol(ticker);
        const hosts = ['query1.finance.yahoo.com', 'query2.finance.yahoo.com'];

        for (const host of hosts) {
            try {
                const url = `https://${host}/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=1d&range=5d`;
                const response = await fetch(url, {
                    headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0' },
                    signal: AbortSignal.timeout(this.REQUEST_TIMEOUT_MS),
                });
                if (!response.ok) continue;

                const payload = await response.json();
                const result = payload?.chart?.result?.[0];
                if (!result) continue;

                const extractedAt = new Date();
                const timestamps: number[] = Array.isArray(result.timestamp) ? result.timestamp : [];
                const quote = result.indicators?.quote?.[0] || {};
                const opens: Array<number | null> = quote.open || [];
                const highs: Array<number | null> = quote.high || [];
                const lows: Array<number | null> = quote.low || [];
                const closes: Array<number | null> = quote.close || [];
                const volumes: Array<number | null> = quote.volume || [];

                const barsByDate = new Map<string, ParsedQuoteBar>();

                for (let i = 0; i < timestamps.length; i++) {
                    const closeVal = closes[i];
                    if (closeVal === null || closeVal === undefined || Number.isNaN(Number(closeVal))) {
                        continue;
                    }

                    const dateStr = this.getSaoPauloDateString(new Date(timestamps[i] * 1000));
                    const close = Number(Number(closeVal).toFixed(2));
                    const open = this.validNumber(opens[i], close);
                    const high = this.validNumber(highs[i], close);
                    const low = this.validNumber(lows[i], close);
                    const volume = Math.max(0, Math.round(Number(volumes[i] ?? 0)));

                    barsByDate.set(dateStr, {
                        dateStr,
                        open,
                        high,
                        low,
                        close,
                        volume,
                        source: 'Yahoo Finance (v8)',
                        extractedAt,
                    });
                }

                // Aplica preço mais recente em tempo real do bloco meta
                const meta = result.meta;
                if (meta && typeof meta.regularMarketPrice === 'number' && !Number.isNaN(meta.regularMarketPrice)) {
                    const marketDate = meta.regularMarketTime
                        ? new Date(meta.regularMarketTime * 1000)
                        : extractedAt;
                    const marketDateStr = this.getSaoPauloDateString(marketDate);
                    const liveClose = Number(meta.regularMarketPrice.toFixed(2));
                    const existingBar = barsByDate.get(marketDateStr);

                    barsByDate.set(marketDateStr, {
                        dateStr: marketDateStr,
                        open: existingBar?.open ?? liveClose,
                        high: this.validNumber(meta.regularMarketDayHigh, existingBar?.high ?? liveClose),
                        low: this.validNumber(meta.regularMarketDayLow, existingBar?.low ?? liveClose),
                        close: liveClose,
                        volume: Math.max(
                            0,
                            Math.round(Number(meta.regularMarketVolume ?? existingBar?.volume ?? 0)),
                        ),
                        source: 'Yahoo Finance (v8)',
                        extractedAt,
                    });
                }

                return Array.from(barsByDate.values()).sort((a, b) =>
                    a.dateStr.localeCompare(b.dateStr),
                );
            } catch (error) {
                this.logger.debug(`Yahoo ${host} falhou para ${yahooSymbol}: ${error.message}`);
            }
        }

        return [];
    }

    private async fetchFromBrapi(ticker: string, token: string): Promise<ParsedQuoteBar[]> {
        const brapiSymbol = ticker === 'IBOV' ? '^BVSP' : ticker;
        const url = `https://brapi.dev/api/quote/${encodeURIComponent(brapiSymbol)}?range=5d&interval=1d&token=${encodeURIComponent(token)}`;
        const response = await fetch(url, {
            headers: { Accept: 'application/json' },
            signal: AbortSignal.timeout(this.REQUEST_TIMEOUT_MS),
        });
        if (!response.ok) return [];

        const data = await response.json();
        const item = data?.results?.[0];
        if (!item) return [];

        const extractedAt = new Date();
        const barsByDate = new Map<string, ParsedQuoteBar>();

        if (Array.isArray(item.historicalDataPrice)) {
            for (const h of item.historicalDataPrice) {
                if (typeof h.close !== 'number') continue;
                const dateStr = this.getSaoPauloDateString(new Date(h.date * 1000));
                const close = Number(h.close.toFixed(2));
                barsByDate.set(dateStr, {
                    dateStr,
                    open: this.validNumber(h.open, close),
                    high: this.validNumber(h.high, close),
                    low: this.validNumber(h.low, close),
                    close,
                    volume: Math.max(0, Math.round(Number(h.volume ?? 0))),
                    source: 'Brapi (B3)',
                    extractedAt,
                });
            }
        }

        if (typeof item.regularMarketPrice === 'number') {
            const marketDate = item.regularMarketTime
                ? new Date(item.regularMarketTime)
                : extractedAt;
            const dateStr = this.getSaoPauloDateString(marketDate);
            const close = Number(item.regularMarketPrice.toFixed(2));
            const existing = barsByDate.get(dateStr);
            barsByDate.set(dateStr, {
                dateStr,
                open: this.validNumber(item.regularMarketOpen, existing?.open ?? close),
                high: this.validNumber(item.regularMarketDayHigh, existing?.high ?? close),
                low: this.validNumber(item.regularMarketDayLow, existing?.low ?? close),
                close,
                volume: Math.max(
                    0,
                    Math.round(Number(item.regularMarketVolume ?? existing?.volume ?? 0)),
                ),
                source: 'Brapi (B3)',
                extractedAt,
            });
        }

        return Array.from(barsByDate.values()).sort((a, b) => a.dateStr.localeCompare(b.dateStr));
    }

    private async upsertQuotes(asset: Asset, bars: ParsedQuoteBar[]): Promise<void> {
        let inserted = 0;
        let updated = 0;

        for (let i = 0; i < bars.length; i++) {
            const bar = bars[i];
            const isLatest = i === bars.length - 1;

            const existingQuote = await this.quoteRepository.findOne({
                where: {
                    asset: { id: asset.id },
                    date: bar.dateStr as any,
                },
            });

            if (!existingQuote) {
                const newQuote = this.quoteRepository.create({
                    asset,
                    date: bar.dateStr as any,
                    open: bar.open,
                    high: bar.high,
                    low: bar.low,
                    close: bar.close,
                    volume: bar.volume,
                    source: bar.source,
                    extractedAt: bar.extractedAt,
                });
                await this.quoteRepository.save(newQuote);
                inserted++;
            } else {
                const priceChanged =
                    Number(existingQuote.close) !== bar.close ||
                    Number(existingQuote.high) !== bar.high ||
                    Number(existingQuote.low) !== bar.low ||
                    Number(existingQuote.volume) !== bar.volume;

                if (priceChanged || !existingQuote.extractedAt || existingQuote.source !== bar.source || isLatest) {
                    existingQuote.open = bar.open;
                    existingQuote.high = bar.high;
                    existingQuote.low = bar.low;
                    existingQuote.close = bar.close;
                    existingQuote.volume = bar.volume;
                    existingQuote.source = bar.source;
                    existingQuote.extractedAt = bar.extractedAt;
                    await this.quoteRepository.save(existingQuote);
                    updated++;
                }
            }
        }

        if (inserted > 0 || updated > 0) {
            this.logger.debug(`${asset.ticker}: ${inserted} cotação(ões) inserida(s), ${updated} atualizada(s).`);
        }
    }

    private toYahooSymbol(ticker: string): string {
        const upper = ticker.trim().toUpperCase();
        if (upper === 'IBOV' || upper === 'IBOVESPA') return '^BVSP';
        if (upper.startsWith('^') || upper.includes('.')) return upper;
        return `${upper}.SA`;
    }

    private isSupportedB3Ticker(ticker: string): boolean {
        return ticker === 'IBOV' || /^[A-Z]{4}\d{1,2}$/.test(ticker);
    }

    private validNumber(val: unknown, fallback: number): number {
        const num = Number(val);
        return val !== null && val !== undefined && !Number.isNaN(num) && num > 0
            ? Number(num.toFixed(2))
            : fallback;
    }

    private getSaoPauloDateString(date: Date): string {
        return new Intl.DateTimeFormat('en-CA', {
            timeZone: 'America/Sao_Paulo',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).format(date);
    }
}
