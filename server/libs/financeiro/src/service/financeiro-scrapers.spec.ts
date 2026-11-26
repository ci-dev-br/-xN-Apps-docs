import { BcbScraperService } from './bcb-scraper.service';
import { ScraperService } from './scraper.service';
import { MacroIndicatorsService } from './macro-indicators.service';
import { QuotesService } from './quotes.services';

describe('Financeiro Scrapers & Services', () => {
    const originalFetch = global.fetch;

    afterEach(() => {
        global.fetch = originalFetch;
        jest.restoreAllMocks();
    });

    it('BcbScraperService should use annualized BCB codes (432, 1178, 4389), filter future dates, and fetch real-time FX from AwesomeAPI with source and extractedAt', async () => {
        const savedMacro: any[] = [];
        const macroRepo: any = {
            count: jest.fn().mockResolvedValue(0),
            findOne: jest.fn().mockImplementation(async ({ where }) =>
                savedMacro.find(r => r.name === where.name && r.date === where.date) || null,
            ),
            create: jest.fn().mockImplementation(obj => ({ ...obj })),
            save: jest.fn().mockImplementation(async obj => {
                const idx = savedMacro.findIndex(r => r.name === obj.name && r.date === obj.date);
                if (idx >= 0) savedMacro[idx] = obj;
                else savedMacro.push(obj);
                return obj;
            }),
        };
        const configRepo: any = {
            find: jest.fn().mockResolvedValue([]),
        };

        const todaySp = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'America/Sao_Paulo',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).format(new Date());
        const [y, m, d] = todaySp.split('-');
        const todayBr = `${d}/${m}/${y}`;

        global.fetch = jest.fn().mockImplementation(async (url: string) => {
            if (url.includes('coingecko.com/api/v3/simple/price')) {
                return {
                    ok: true,
                    json: async () => ({
                        bitcoin: { brl: 346112, brl_24h_change: -4.92, last_updated_at: 1795246674 },
                        ethereum: { brl: 9723.25, brl_24h_change: -5.52, last_updated_at: 1795246674 },
                    }),
                } as any;
            }
            if (url.includes('coingecko.com/api/v3/global')) {
                return {
                    ok: true,
                    json: async () => ({
                        data: {
                            total_market_cap: { usd: 2016515628876 },
                            market_cap_change_percentage_24h_usd: -8.16,
                            market_cap_percentage: { btc: 57.61 },
                            updated_at: 1795246260,
                        },
                    }),
                } as any;
            }
            if (url.includes('alternative.me/fng')) {
                return {
                    ok: true,
                    json: async () => ({
                        data: [
                            { value: '12', value_classification: 'Extreme Fear', timestamp: '1795219200' },
                            { value: '14', value_classification: 'Extreme Fear', timestamp: '1795132800' },
                        ],
                    }),
                } as any;
            }
            if (url.includes('awesomeapi.com.br')) {
                return {
                    ok: true,
                    json: async () => ({
                        USDBRL: { ask: '5.9493', pctChange: '0.22', create_date: `${todaySp} 15:18:54` },
                        EURBRL: { ask: '6.5192', pctChange: '0.14', create_date: `${todaySp} 19:01:48` },
                    }),
                } as any;
            }
            if (url.includes('bcdata.sgs.432')) {
                return {
                    ok: true,
                    json: async () => [
                        { data: todayBr, valor: '13.75' },
                        { data: '31/12/2099', valor: '14.00' }, // futuro deve ser ignorado
                    ],
                } as any;
            }
            if (url.includes('bcdata.sgs.1178')) {
                return { ok: true, json: async () => [{ data: todayBr, valor: '13.65' }] } as any;
            }
            if (url.includes('bcdata.sgs.4389')) {
                return { ok: true, json: async () => [{ data: todayBr, valor: '13.65' }] } as any;
            }
            return {
                ok: true,
                json: async () => [{ data: '01/10/2026', valor: '0.14' }],
            } as any;
        });

        const service = new BcbScraperService(macroRepo, configRepo);
        await service.fetchMacroIndicators(true);

        const selicMeta = savedMacro.find(r => r.name === 'META_SELIC');
        expect(selicMeta).toBeDefined();
        expect(selicMeta.date).toBe(todaySp);
        expect(selicMeta.value).toBe(13.75);
        expect(selicMeta.source).toBe('Banco Central (SGS 432)');
        expect(selicMeta.extractedAt).toBeInstanceOf(Date);

        const cdi = savedMacro.find(r => r.name === 'CDI');
        expect(cdi.value).toBe(13.65);
        expect(cdi.source).toBe('Banco Central (SGS 4389)');

        const dolar = savedMacro.find(r => r.name === 'DOLAR');
        expect(dolar.value).toBe(5.9493);
        expect(dolar.variation).toBe(0.22);
        expect(dolar.source).toBe('AwesomeAPI (Câmbio)');
        expect(dolar.extractedAt).toBeInstanceOf(Date);

        const btc = savedMacro.find(r => r.name === 'BTC');
        expect(btc.value).toBe(346112);
        expect(btc.variation).toBe(-4.92);
        expect(btc.source).toBe('CoinGecko (Crypto)');
        expect(btc.extractedAt).toBeInstanceOf(Date);

        const fng = savedMacro.find(r => r.name === 'CRYPTO_FEAR_GREED');
        expect(fng.value).toBe(12);
        expect(fng.variation).toBe(-2);
        expect(fng.source).toBe('Alternative.me (Extreme Fear)');

        const btcDom = savedMacro.find(r => r.name === 'BTC_DOMINANCE');
        expect(btcDom.value).toBe(57.61);
        expect(btcDom.source).toBe('CoinGecko Global');
    });

    it('ScraperService and QuotesService should fetch via Yahoo v8 Chart, upsert quotes with extractedAt, and return newest first', async () => {
        const assets: any[] = [];
        const quotes: any[] = [];

        const assetRepo: any = {
            findOne: jest.fn().mockImplementation(async ({ where }) =>
                assets.find(a => a.ticker === where.ticker) || null,
            ),
            find: jest.fn().mockImplementation(async () => assets),
            create: jest.fn().mockImplementation(obj => ({ id: `asset_${obj.ticker}`, ...obj })),
            save: jest.fn().mockImplementation(async obj => {
                if (!assets.some(a => a.ticker === obj.ticker)) assets.push(obj);
                return obj;
            }),
        };

        const quoteRepo: any = {
            count: jest.fn().mockResolvedValue(0),
            findOne: jest.fn().mockImplementation(async ({ where }) =>
                quotes.find(q => q.asset.id === where.asset.id && q.date === where.date) || null,
            ),
            find: jest.fn().mockImplementation(async ({ where, take }) => {
                const filtered = quotes
                    .filter(q => q.asset.id === where.asset.id)
                    .sort((a, b) => String(b.date).localeCompare(String(a.date)));
                return take ? filtered.slice(0, take) : filtered;
            }),
            create: jest.fn().mockImplementation(obj => ({ ...obj })),
            save: jest.fn().mockImplementation(async obj => {
                const idx = quotes.findIndex(q => q.asset.id === obj.asset.id && q.date === obj.date);
                if (idx >= 0) quotes[idx] = obj;
                else quotes.push(obj);
                return obj;
            }),
        };

        const day1Ts = Math.floor(new Date('2026-11-18T15:00:00Z').getTime() / 1000);
        const day2Ts = Math.floor(new Date('2026-11-19T15:00:00Z').getTime() / 1000);

        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                chart: {
                    result: [{
                        meta: {
                            regularMarketPrice: 42.67,
                            regularMarketTime: day2Ts,
                            regularMarketDayHigh: 43.6,
                            regularMarketDayLow: 42.41,
                            regularMarketVolume: 39230100,
                        },
                        timestamp: [day1Ts, day2Ts],
                        indicators: {
                            quote: [{
                                open: [43.0, 43.2],
                                high: [43.5, 43.6],
                                low: [42.8, 42.41],
                                close: [43.17, 42.50],
                                volume: [20000000, 39000000],
                            }],
                        },
                    }],
                },
            }),
        } as any);

        const scraper = new ScraperService(assetRepo, quoteRepo);
        const quotesService = new QuotesService(assetRepo, quoteRepo, scraper);

        const recent = await quotesService.getRecentQuotes('PETR4', 2);

        expect(recent.length).toBe(2);
        // Mais recente primeiro (42.67 do meta.regularMarketPrice)
        expect(recent[0].date).toBe('2026-11-19');
        expect(recent[0].close).toBe(42.67);
        expect(recent[0].variation).toBe(-1.16);
        expect(recent[0].source).toBe('Yahoo Finance (v8)');
        expect(recent[0].extractedAt).toBeInstanceOf(Date);
        expect(recent[1].date).toBe('2026-11-18');
        expect(recent[1].close).toBe(43.17);
    });

    it('MacroIndicatorsService should trigger freshness check and deduplicate by indicator name', async () => {
        const qb: any = {
            select: jest.fn().mockReturnThis(),
            addSelect: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            groupBy: jest.fn().mockReturnThis(),
            getQuery: jest.fn().mockReturnValue('SELECT name, MAX(date) FROM mi'),
            getParameters: jest.fn().mockReturnValue({ today: '2026-11-21' }),
            innerJoin: jest.fn().mockReturnThis(),
            setParameters: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            addOrderBy: jest.fn().mockReturnThis(),
            getMany: jest.fn().mockResolvedValue([
                { name: 'DOLAR', value: 5.9493, date: '2026-11-20', extractedAt: new Date('2026-11-21T07:00:00Z'), source: 'AwesomeAPI (Câmbio)' },
                { name: 'DOLAR', value: 5.8889, date: '2026-11-20', extractedAt: new Date('2026-11-21T06:00:00Z'), source: 'Old' },
            ]),
        };
        const macroRepo: any = {
            createQueryBuilder: jest.fn().mockReturnValue(qb),
        };
        const bcbScraper: any = {
            ensureFreshData: jest.fn().mockResolvedValue(undefined),
        };

        const service = new MacroIndicatorsService(macroRepo, bcbScraper);
        const result = await service.getLatestIndicators();

        expect(bcbScraper.ensureFreshData).toHaveBeenCalledTimes(1);
        expect(result).toHaveLength(1);
        expect(result[0].value).toBe(5.9493);
        expect(result[0].queriedAt).toBeDefined();
    });
});
