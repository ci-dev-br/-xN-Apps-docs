import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MacroIndicator } from '../model/macro-indicator.entity';
import { IndicatorConfig } from '../model/indicator-config.entity';

interface BcbIndicatorDef {
    name: string;
    code: number;
    source: string;
}

interface BcbSgsRecord {
    data: string;
    valor: string;
}

interface ParsedMacroRecord {
    dateStr: string;
    value: number;
    variation: number | null;
    source: string;
    extractedAt: Date;
}

@Injectable()
export class BcbScraperService implements OnModuleInit {
    private readonly logger = new Logger(BcbScraperService.name);

    private readonly FX_TTL_MS = 5 * 60 * 1000;       // 5 minutos para câmbio em tempo real
    private readonly BCB_TTL_MS = 60 * 60 * 1000;     // 1 hora para séries do BCB
    private readonly REQUEST_TIMEOUT_MS = 8000;
    private readonly ON_DEMAND_WAIT_MS = 6000;

    private bcbSyncPromise: Promise<void> | null = null;
    private fxSyncPromise: Promise<void> | null = null;
    private lastBcbSyncAt = 0;
    private lastFxSyncAt = 0;

    // Séries SGS anualizadas (% a.a.) e mensais (% a.m.) do Banco Central
    private readonly BCB_INDICATORS: BcbIndicatorDef[] = [
        // --- Taxas Básicas de Juros (% a.a.) ---
        { name: 'META_SELIC', code: 432, source: 'Banco Central (SGS 432)' },   // Taxa Meta Selic fixada pelo COPOM (% a.a.)
        { name: 'SELIC', code: 1178, source: 'Banco Central (SGS 1178)' },      // Taxa Selic anualizada base 252 (% a.a.)
        { name: 'CDI', code: 4389, source: 'Banco Central (SGS 4389)' },        // Taxa CDI acumulada no mês anualizada base 252 (% a.a.)

        // --- Inflação (% a.m.) ---
        { name: 'IPCA', code: 433, source: 'Banco Central / IBGE (SGS 433)' },  // IPCA (% a.m.)
        { name: 'IGPM', code: 189, source: 'Banco Central / FGV (SGS 189)' },   // IGP-M (% a.m.)

        // --- Outros ---
        { name: 'POUPANCA', code: 195, source: 'Banco Central (SGS 195)' },     // Rendimento mensal da Poupança (% a.m.)
    ];

    private readonly FX_BCB_FALLBACK: BcbIndicatorDef[] = [
        { name: 'DOLAR', code: 1, source: 'Banco Central (PTAX SGS 1)' },
        { name: 'EURO', code: 21619, source: 'Banco Central (PTAX SGS 21619)' },
    ];

    constructor(
        @InjectRepository(MacroIndicator)
        private readonly macroIndicatorRepository: Repository<MacroIndicator>,
        @InjectRepository(IndicatorConfig)
        private readonly indicatorConfigRepository: Repository<IndicatorConfig>,
    ) { }

    async onModuleInit() {
        this.logger.log('Verificando carga inicial de dados macroeconômicos...');
        const count = await this.macroIndicatorRepository.count();

        if (count === 0) {
            this.logger.warn('Tabela de indicadores vazia! Realizando carga inicial...');
            await this.fetchMacroIndicators(true);
        } else {
            this.logger.log(`Tabela possui ${count} registros. Atualizando indicadores em background...`);
            this.fetchMacroIndicators(true).catch(err =>
                this.logger.warn(`Falha na atualização inicial em background: ${err.message}`),
            );
        }
    }

    /**
     * Garante que os dados armazenados estejam atualizados antes de servir leituras.
     */
    async ensureFreshData(): Promise<void> {
        const now = Date.now();
        const latestFx = await this.macroIndicatorRepository.findOne({
            where: { name: 'DOLAR' },
            order: { date: 'DESC' },
        });
        const latestRate = await this.macroIndicatorRepository.findOne({
            where: { name: 'SELIC' },
            order: { date: 'DESC' },
        });

        const fxMissingOrStale =
            !latestFx ||
            !latestFx.extractedAt ||
            now - new Date(latestFx.extractedAt).getTime() > this.FX_TTL_MS;

        const bcbMissingOrStale =
            !latestRate ||
            !latestRate.extractedAt ||
            now - new Date(latestRate.extractedAt).getTime() > this.BCB_TTL_MS;

        const tasks: Promise<void>[] = [];
        if (fxMissingOrStale) tasks.push(this.fetchRealtimeCurrencies(false));
        if (bcbMissingOrStale) tasks.push(this.fetchBcbIndicators(false));

        if (tasks.length === 0) return;

        await Promise.race([
            Promise.allSettled(tasks),
            new Promise<void>(resolve => setTimeout(resolve, this.ON_DEMAND_WAIT_MS)),
        ]);
    }

    /**
     * Atualiza todos os macroindicadores (BCB + Câmbio em tempo real).
     */
    async fetchMacroIndicators(force = false): Promise<void> {
        await Promise.allSettled([
            this.fetchBcbIndicators(force),
            this.fetchRealtimeCurrencies(force),
        ]);
    }

    /**
     * Atualiza taxas de câmbio (Dólar e Euro) a cada 5 minutos.
     */
    @Cron('*/5 * * * *')
    async fetchRealtimeCurrencies(force = false): Promise<void> {
        if (this.fxSyncPromise) return this.fxSyncPromise;
        if (!force && Date.now() - this.lastFxSyncAt < 60_000) return;

        this.fxSyncPromise = (async () => {
            this.logger.debug('Atualizando cotações de câmbio em tempo real (USD/BRL, EUR/BRL)...');
            const synced = new Set<string>();

            // 1. Fonte primária: AwesomeAPI (tempo real)
            try {
                const awesomeRecords = await this.fetchCurrenciesFromAwesomeApi();
                for (const [name, record] of Object.entries(awesomeRecords)) {
                    await this.upsertRecords(name, [record]);
                    synced.add(name);
                }
            } catch (error) {
                this.logger.warn(`AwesomeAPI indisponível para câmbio: ${error.message}`);
            }

            // 2. Fallback 1: Yahoo Finance v8 (USDBRL=X, EURBRL=X)
            const missingAfterAwesome = (['DOLAR', 'EURO'] as const).filter(n => !synced.has(n));
            if (missingAfterAwesome.length > 0) {
                for (const name of missingAfterAwesome) {
                    const symbol = name === 'DOLAR' ? 'USDBRL=X' : 'EURBRL=X';
                    try {
                        const yahooRecord = await this.fetchCurrencyFromYahoo(symbol);
                        if (yahooRecord) {
                            await this.upsertRecords(name, [yahooRecord]);
                            synced.add(name);
                        }
                    } catch (error) {
                        this.logger.warn(`Yahoo Finance indisponível para ${symbol}: ${error.message}`);
                    }
                }
            }

            // 3. Fallback 2: BCB SGS PTAX
            for (const fb of this.FX_BCB_FALLBACK) {
                if (!synced.has(fb.name)) {
                    await this.fetchSingleBcbIndicator(fb);
                }
            }

            this.lastFxSyncAt = Date.now();
        })().finally(() => {
            this.fxSyncPromise = null;
        });

        return this.fxSyncPromise;
    }

    /**
     * Atualiza séries macroeconômicas do Banco Central a cada 1 hora.
     */
    @Cron(CronExpression.EVERY_HOUR)
    async fetchBcbIndicators(force = false): Promise<void> {
        if (this.bcbSyncPromise) return this.bcbSyncPromise;
        if (!force && Date.now() - this.lastBcbSyncAt < 5 * 60_000) return;

        this.bcbSyncPromise = (async () => {
            this.logger.log('Iniciando coleta de indicadores macroeconômicos (BCB SGS)...');

            const indicators: BcbIndicatorDef[] = [...this.BCB_INDICATORS];

            try {
                const activeConfigs = await this.indicatorConfigRepository.find({
                    where: { isActive: true },
                });
                const knownNames = new Set([
                    ...indicators.map(i => i.name.toUpperCase()),
                    'DOLAR',
                    'EURO',
                ]);
                for (const cfg of activeConfigs) {
                    if (!knownNames.has(cfg.name.toUpperCase())) {
                        indicators.push({
                            name: cfg.name.toUpperCase(),
                            code: cfg.code,
                            source: `Banco Central (SGS ${cfg.code})`,
                        });
                    }
                }
            } catch (error) {
                this.logger.debug(`Ignorando leitura de IndicatorConfig: ${error.message}`);
            }

            for (const indicator of indicators) {
                await this.fetchSingleBcbIndicator(indicator);
            }

            this.lastBcbSyncAt = Date.now();
            this.logger.log('Coleta de indicadores do BCB finalizada.');
        })().finally(() => {
            this.bcbSyncPromise = null;
        });

        return this.bcbSyncPromise;
    }

    private async fetchSingleBcbIndicator(indicator: BcbIndicatorDef): Promise<void> {
        const todayStr = this.getSaoPauloDateString(new Date());
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 90);

        const dataInicial = this.formatBcbDate(startDate);
        const dataFinal = this.formatBcbDate(new Date());

        const rangeUrl = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${indicator.code}/dados?formato=json&dataInicial=${dataInicial}&dataFinal=${dataFinal}`;
        const latestUrl = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${indicator.code}/dados/ultimos/5?formato=json`;

        try {
            let data = await this.fetchBcbJson(rangeUrl);
            if (!data || data.length === 0) {
                data = await this.fetchBcbJson(latestUrl);
            }

            if (!data || data.length === 0) {
                this.logger.warn(`Nenhum dado retornado pelo BCB para ${indicator.name} (SGS ${indicator.code}).`);
                return;
            }

            const extractedAt = new Date();
            const normalized = data
                .map(rec => ({
                    dateStr: this.bcbDateToIso(rec.data),
                    value: parseFloat(String(rec.valor).replace(',', '.')),
                }))
                .filter(rec => rec.dateStr && !Number.isNaN(rec.value) && rec.dateStr <= todayStr)
                .sort((a, b) => a.dateStr.localeCompare(b.dateStr));

            if (normalized.length === 0) return;

            const records: ParsedMacroRecord[] = normalized.map((rec, idx) => {
                const prev = idx > 0 ? normalized[idx - 1] : null;
                const variation = prev !== null ? Number((rec.value - prev.value).toFixed(4)) : null;
                return {
                    dateStr: rec.dateStr,
                    value: rec.value,
                    variation,
                    source: indicator.source,
                    extractedAt,
                };
            });

            // Mantém histórico recente (últimos 10 registros retornados) e garante o registro mais recente com extractedAt atual
            await this.upsertRecords(indicator.name, records.slice(-10));
        } catch (error) {
            this.logger.error(`Erro ao buscar ${indicator.name} (SGS ${indicator.code}): ${error.message}`);
        }
    }

    private async fetchBcbJson(url: string): Promise<BcbSgsRecord[]> {
        const response = await fetch(url, {
            headers: { Accept: 'application/json', 'User-Agent': 'ci-apps-financeiro/1.0' },
            signal: AbortSignal.timeout(this.REQUEST_TIMEOUT_MS),
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const json = await response.json();
        return Array.isArray(json) ? json : [];
    }

    private async fetchCurrenciesFromAwesomeApi(): Promise<Record<string, ParsedMacroRecord>> {
        const url = 'https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL';
        const response = await fetch(url, {
            headers: { Accept: 'application/json', 'User-Agent': 'ci-apps-financeiro/1.0' },
            signal: AbortSignal.timeout(this.REQUEST_TIMEOUT_MS),
        });
        if (!response.ok) {
            throw new Error(`AwesomeAPI HTTP ${response.status}`);
        }

        const data: Record<string, any> = await response.json();
        const extractedAt = new Date();
        const result: Record<string, ParsedMacroRecord> = {};

        const pairs: Array<{ key: string; name: string }> = [
            { key: 'USDBRL', name: 'DOLAR' },
            { key: 'EURBRL', name: 'EURO' },
        ];

        for (const pair of pairs) {
            const entry = data?.[pair.key];
            if (!entry) continue;

            const value = parseFloat(entry.ask || entry.bid);
            if (Number.isNaN(value)) continue;

            const pct = parseFloat(entry.pctChange);
            const variation = Number.isNaN(pct) ? null : Number(pct.toFixed(4));
            const dateStr =
                typeof entry.create_date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(entry.create_date)
                    ? entry.create_date.slice(0, 10)
                    : this.getSaoPauloDateString(extractedAt);

            result[pair.name] = {
                dateStr,
                value,
                variation,
                source: 'AwesomeAPI (Câmbio)',
                extractedAt,
            };
        }

        if (Object.keys(result).length === 0) {
            throw new Error('AwesomeAPI retornou payload vazio');
        }

        return result;
    }

    private async fetchCurrencyFromYahoo(symbol: string): Promise<ParsedMacroRecord | null> {
        const hosts = ['query1.finance.yahoo.com', 'query2.finance.yahoo.com'];
        for (const host of hosts) {
            const url = `https://${host}/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=2d`;
            const response = await fetch(url, {
                headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0' },
                signal: AbortSignal.timeout(this.REQUEST_TIMEOUT_MS),
            });
            if (!response.ok) continue;

            const payload = await response.json();
            const meta = payload?.chart?.result?.[0]?.meta;
            if (!meta || typeof meta.regularMarketPrice !== 'number') continue;

            const extractedAt = new Date();
            const marketTime = meta.regularMarketTime
                ? new Date(meta.regularMarketTime * 1000)
                : extractedAt;

            const variation =
                typeof meta.regularMarketChangePercent === 'number'
                    ? Number(meta.regularMarketChangePercent.toFixed(4))
                    : null;

            return {
                dateStr: this.getSaoPauloDateString(marketTime),
                value: meta.regularMarketPrice,
                variation,
                source: 'Yahoo Finance (Câmbio)',
                extractedAt,
            };
        }
        return null;
    }

    private async upsertRecords(indicatorName: string, records: ParsedMacroRecord[]): Promise<void> {
        let insertedCount = 0;
        let updatedCount = 0;

        for (let i = 0; i < records.length; i++) {
            const rec = records[i];
            const isLatest = i === records.length - 1;

            const existingRecord = await this.macroIndicatorRepository.findOne({
                where: {
                    name: indicatorName,
                    date: rec.dateStr as any,
                },
            });

            if (!existingRecord) {
                const newIndicator = this.macroIndicatorRepository.create({
                    name: indicatorName,
                    date: rec.dateStr as any,
                    value: rec.value,
                    variation: rec.variation,
                    source: rec.source,
                    extractedAt: rec.extractedAt,
                });
                await this.macroIndicatorRepository.save(newIndicator);
                insertedCount++;
            } else {
                const valueChanged = Number(existingRecord.value) !== Number(rec.value);
                const variationChanged =
                    (existingRecord.variation !== null && existingRecord.variation !== undefined
                        ? Number(existingRecord.variation)
                        : null) !== rec.variation;
                const sourceChanged = existingRecord.source !== rec.source;

                if (valueChanged || variationChanged || sourceChanged || !existingRecord.extractedAt || isLatest) {
                    existingRecord.value = rec.value;
                    existingRecord.variation = rec.variation;
                    existingRecord.source = rec.source;
                    existingRecord.extractedAt = rec.extractedAt;
                    await this.macroIndicatorRepository.save(existingRecord);
                    updatedCount++;
                }
            }
        }

        if (insertedCount > 0 || updatedCount > 0) {
            this.logger.debug(
                `${indicatorName}: ${insertedCount} inserido(s), ${updatedCount} atualizado(s).`,
            );
        }
    }

    private getSaoPauloDateString(date: Date): string {
        return new Intl.DateTimeFormat('en-CA', {
            timeZone: 'America/Sao_Paulo',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).format(date);
    }

    private formatBcbDate(date: Date): string {
        const [year, month, day] = this.getSaoPauloDateString(date).split('-');
        return `${day}/${month}/${year}`;
    }

    private bcbDateToIso(bcbDateStr: string): string {
        const parts = String(bcbDateStr || '').split('/');
        if (parts.length !== 3) return '';
        const [day, month, year] = parts;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
}
