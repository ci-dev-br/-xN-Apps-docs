import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual } from 'typeorm';
import { Asset } from './../model/asset.entity';
import { DailyQuote } from './../model/daily-quote.entity';
import { MacroIndicator } from './../model/macro-indicator.entity';

@Injectable()
export class InflationService {
    constructor(
        @InjectRepository(Asset)
        private readonly assetRepository: Repository<Asset>,
        @InjectRepository(DailyQuote)
        private readonly quoteRepository: Repository<DailyQuote>,
        @InjectRepository(MacroIndicator)
        private readonly macroIndicatorRepository: Repository<MacroIndicator>,
    ) { }

    /**
     * Ajusta o preço de uma ação em uma data passada para valores de hoje (ou data final) usando o IPCA.
     */
    async getInflationAdjustedPrice(ticker: string, startDate: Date, endDate: Date = new Date()) {
        // 1. Validar se o ativo existe
        const asset = await this.assetRepository.findOne({ where: { ticker } });
        if (!asset) {
            throw new NotFoundException(`Ativo ${ticker} não encontrado.`);
        }

        // 2. Buscar a cotação histórica mais próxima da data inicial (para trás)
        const pastQuote = await this.quoteRepository.findOne({
            where: {
                asset: { id: asset.id },
                date: LessThanOrEqual(startDate),
            },
            order: { date: 'DESC' },
        });

        if (!pastQuote) {
            throw new NotFoundException(`Nenhuma cotação encontrada para ${ticker} até a data ${startDate.toISOString()}`);
        }

        // 3. Buscar a série histórica do IPCA entre a data da cotação e a data final
        const ipcaRecords = await this.macroIndicatorRepository.find({
            where: {
                name: 'IPCA',
                date: Between(pastQuote.date, endDate),
            },
            order: { date: 'ASC' },
        });

        // 4. Calcular o fator acumulado da inflação
        let accumulatedMultiplier = 1;

        ipcaRecords.forEach((record) => {
            // O BCB retorna o IPCA em porcentagem ao mês (ex: 0.53 para 0.53%)
            const monthlyRate = Number(record.value) / 100;
            accumulatedMultiplier *= (1 + monthlyRate);
        });

        // 5. Ajustar o preço nominal pelo multiplicador acumulado
        const nominalPrice = Number(pastQuote.close);
        const adjustedPrice = nominalPrice * accumulatedMultiplier;

        // 6. Opcional: Buscar cotação atual para efeito de comparação (Rentabilidade Real vs Nominal)
        const currentQuote = await this.quoteRepository.findOne({
            where: { asset: { id: asset.id }, date: LessThanOrEqual(endDate) },
            order: { date: 'DESC' },
        });
        const currentPrice = currentQuote ? Number(currentQuote.close) : null;

        return {
            ticker,
            period: {
                start: pastQuote.date,
                end: endDate,
            },
            inflation: {
                accumulatedPercentage: Number(((accumulatedMultiplier - 1) * 100).toFixed(4)),
                monthsCount: ipcaRecords.length,
            },
            prices: {
                pastNominal: nominalPrice,
                adjustedToInflation: Number(adjustedPrice.toFixed(2)),
                currentMarketPrice: currentPrice,
            },
            analysis: currentPrice ? {
                nominalReturnPercentage: Number(((currentPrice / nominalPrice - 1) * 100).toFixed(2)),
                realReturnPercentage: Number(((currentPrice / adjustedPrice - 1) * 100).toFixed(2)),
            } : null,
        };
    }
}