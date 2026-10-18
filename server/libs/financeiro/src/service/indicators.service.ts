import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Asset } from '../model/asset.entity';
import { DailyQuote } from '../model/daily-quote.entity';
import { FinancialStatement } from '../model/financial-statement.entity';

@Injectable()
export class IndicatorsService {
    constructor(
        @InjectRepository(Asset)
        private readonly assetRepository: Repository<Asset>,
        @InjectRepository(DailyQuote)
        private readonly quoteRepository: Repository<DailyQuote>,
        @InjectRepository(FinancialStatement)
        private readonly statementRepository: Repository<FinancialStatement>,
    ) { }

    /**
     * Calcula P/L e P/VP de um ativo para uma data específica.
     */
    async getFundamentalIndicators(ticker: string, targetDate: Date) {
        // 1. Busca o Ativo e sua Empresa correspondente
        const asset = await this.assetRepository.findOne({
            where: { ticker },
            relations: ['company'],
        });

        if (!asset) {
            throw new NotFoundException(`Ativo com ticker ${ticker} não encontrado.`);
        }

        // 2. Busca a última cotação de fechamento disponível até a data alvo
        const lastQuote = await this.quoteRepository.findOne({
            where: {
                asset: { id: asset.id },
                date: LessThanOrEqual(targetDate), // Pega a data exata ou o último dia útil anterior
            },
            order: { date: 'DESC' },
        });

        if (!lastQuote) {
            throw new NotFoundException(`Cotação não encontrada para ${ticker} até ${targetDate}.`);
        }

        // 3. Busca a demonstração financeira consolidada mais recente até a data alvo
        const latestStatement = await this.statementRepository.findOne({
            where: {
                company: { id: asset.company.id },
                referenceDate: LessThanOrEqual(targetDate),
                statementType: 'CONSOLIDADO',
            },
            order: { referenceDate: 'DESC' },
        });

        if (!latestStatement) {
            throw new NotFoundException(`Balanço não encontrado para a empresa do ticker ${ticker}.`);
        }

        // 4. Lógica de Cálculo dos Indicadores
        // Nota: Estamos assumindo que asset.company.totalShares existe na base
        const totalShares = (asset.company as any).totalShares || 1000000000; // Mock de 1 bilhão de ações caso não exista

        const price = Number(lastQuote.close);
        const netIncome = Number(latestStatement.netIncome);
        const equity = Number(latestStatement.equity);

        // Lucro por Ação (LPA)
        const lpa = netIncome / totalShares;

        // Valor Patrimonial por Ação (VPA)
        const vpa = equity / totalShares;

        // Cálculo Final
        // Se a empresa der prejuízo, o P/L fica negativo ou não se aplica (depende da regra de negócio, aqui mantemos negativo)
        const pl = price / lpa;
        const pvp = price / vpa;

        return {
            ticker,
            date: lastQuote.date,
            price,
            company: asset.company.name,
            statementReferenceDate: latestStatement.referenceDate,
            indicators: {
                pl: Number(pl.toFixed(2)),
                pvp: Number(pvp.toFixed(2)),
                lpa: Number(lpa.toFixed(4)),
                vpa: Number(vpa.toFixed(4)),
            },
            raw_data: {
                netIncome,
                equity,
                totalShares,
            }
        };
    }
}