import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset } from '../model/asset.entity';
import { DailyQuote } from '../model/daily-quote.entity';

@Injectable()
export class QuotesService {
    constructor(
        @InjectRepository(Asset)
        private readonly assetRepository: Repository<Asset>,
        @InjectRepository(DailyQuote)
        private readonly quoteRepository: Repository<DailyQuote>,
    ) { }

    async getRecentQuotes(ticker: string, daysLimit: number = 5) {
        const asset = await this.assetRepository.findOne({ where: { ticker } });

        if (!asset) {
            throw new NotFoundException(`Ativo ${ticker} não encontrado.`);
        }

        // Busca N + 1 cotações para conseguirmos calcular a variação do dia mais antigo solicitado
        const quotes = await this.quoteRepository.find({
            where: { asset: { id: asset.id } },
            order: { date: 'DESC' }, // Traz do mais atual (hoje) para o passado
            take: daysLimit + 1,
        });

        if (quotes.length === 0) {
            return [];
        }

        const result = [];

        // O array está decrescente: [0] = hoje, [1] = ontem, [2] = anteontem...
        for (let i = 0; i < Math.min(daysLimit, quotes.length); i++) {
            const currentDay = quotes[i];
            const previousDay = quotes[i + 1]; // Pode ser undefined no último loop se a ação só tiver 5 dias de histórico (ex: IPO)

            let variation = 0;

            if (previousDay) {
                const currentClose = Number(currentDay.close);
                const previousClose = Number(previousDay.close);
                // Fórmula de variação percentual: ((Atual - Anterior) / Anterior) * 100
                variation = ((currentClose - previousClose) / previousClose) * 100;
            }

            result.push({
                date: currentDay.date,
                close: Number(currentDay.close),
                variation: Number(variation.toFixed(2)),
            });
        }

        // Opcional: Se quiser que no Angular exiba do mais antigo pro mais novo (de cima para baixo),
        // basta dar um result.reverse() aqui. Manteremos original (mais novo no topo).
        return result;
    }
}