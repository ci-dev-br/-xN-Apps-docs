import { Repository } from 'typeorm';
import { BaseCrawler } from './base-crawler';
import { Injectable } from '@nestjs/common';
import { HappyPage } from '../models/happy-page.entity';

@Injectable()
export class HappyNewsCrawler extends BaseCrawler {
    private readonly happyKeywords = [
        'feliz', 'alegria', 'esperança', 'superação',
        'conquista', 'vitória', 'amor', 'paz', 'sorriso',
        'cura', 'solidariedade', 'sucesso'
    ];

    constructor(private pageRepository: Repository<HappyPage>) {
        super(); // Inicializa a base abstrata
    }

    /**
     * Implementação da regra de SEO para "notícias felizes".
     */
    protected evaluatePage(url: string, title: string, content: string): boolean {
        const fullText = `${title} ${content}`.toLowerCase();

        const matchCount = this.happyKeywords.filter(keyword => fullText.includes(keyword)).length;

        return matchCount >= 2;
    }

    /**
     * Implementação da persistência via TypeORM.
     */
    protected async onPageMatched(url: string, title: string, content: string): Promise<void> {
        const alreadyExists = await this.pageRepository.findOneBy({ url });

        if (!alreadyExists) {
            const snippet = content.substring(0, 255).replace(/\n/g, ' ').trim();

            const newPage = this.pageRepository.create({
                url,
                title,
                snippet
            });

            await this.pageRepository.save(newPage);
            console.log(`[HappyNewsCrawler] + Catalogado: ${title}`);
        }
    }
}