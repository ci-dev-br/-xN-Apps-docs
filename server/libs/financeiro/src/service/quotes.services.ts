import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset } from '../model/asset.entity';
import { DailyQuote } from '../model/daily-quote.entity';
import { ScraperService } from './scraper.service';

@Injectable()
export class QuotesService {
    constructor(
        @InjectRepository(Asset)
        private readonly assetRepository: Repository<Asset>,
        @InjectRepository(DailyQuote)
        private readonly quoteRepository: Repository<DailyQuote>,
        private readonly scraperService: ScraperService,
    ) { }

    async getRecentQuotes(ticker: string, daysLimit: number = 5) {
        const normalizedTicker = ticker.trim().toUpperCase();
        await this.scraperService.ensureFreshQuote(normalizedTicker);

        const asset = await this.assetRepository.findOne({ where: { ticker: normalizedTicker } });

        if (!asset) {
            throw new NotFoundException(`Ativo ${normalizedTicker} não encontrado.`);
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
        const queriedAt = new Date().toISOString();

        // O array está decrescente: [0] = mais recente, [1] = dia anterior...
        for (let i = 0; i < Math.min(daysLimit, quotes.length); i++) {
            const currentDay = quotes[i];
            const previousDay = quotes[i + 1];

            let variation = 0;

            if (previousDay && Number(previousDay.close) > 0) {
                const currentClose = Number(currentDay.close);
                const previousClose = Number(previousDay.close);
                variation = ((currentClose - previousClose) / previousClose) * 100;
            }

            result.push({
                date: currentDay.date,
                close: Number(currentDay.close),
                variation: Number(variation.toFixed(2)),
                source: currentDay.source || 'Yahoo Finance (v8)',
                extractedAt: currentDay.extractedAt || null,
                queriedAt,
            });
        }

        return result;
    }
}
