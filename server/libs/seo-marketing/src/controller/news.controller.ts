import { BadRequestException, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News } from '../models/news.entity';
import { Category } from '../models/category.entity';
import { FeedColumnDto } from '../dto/feed.dto';
import { ScraperService } from '../services/scraper.service';
import { Public } from '@ci/auth/decorators/public.decorator';


@ApiTags('News')
@Controller('News')
export class NewsController {
    constructor(
        @InjectRepository(News) private newsRepo: Repository<News>,
        @InjectRepository(Category) private categoryRepo: Repository<Category>,
        private readonly service: ScraperService,
    ) {

    }

    @Post('categories')
    @ApiOperation({ summary: 'Lista todas as categorias catalogadas' })
    @ApiResponse({ status: 200, type: [Category] })
    async getCategories() {
        return this.categoryRepo.find({ order: { isTrending: 'DESC' } });
    }

    @Post(':categoryId')
    @ApiOperation({ summary: 'Busca notícias por categoria' })
    @ApiResponse({ status: 200, type: [News] })
    async getNewsByCategory(@Param('categoryId') categoryId: string) {
        return this.newsRepo.find({
            where: { category: { id: categoryId } },
            order: { scrapedAt: 'DESC' },
            take: 50
        });
    }

    @Public()
    @Post()
    @ApiOperation({ summary: 'Retorna o feed de notícias agrupado por fonte, filtrado pelas top tendências do período' })
    @ApiQuery({ name: 'dataInicial', type: String, example: '2026-08-20T00:00:00.000Z' })
    @ApiQuery({ name: 'dataFinal', type: String, example: '2026-08-28T23:59:59.999Z' })
    @ApiResponse({ status: 200, type: [FeedColumnDto] })
    async getFeed(
        @Query('dataInicial') dataInicialStr: string,
        @Query('dataFinal') dataFinalStr: string,
    ) {
        if (!dataInicialStr || !dataFinalStr) {
            throw new BadRequestException('Os parâmetros dataInicial e dataFinal são obrigatórios.');
        }
        const dataInicial = new Date(dataInicialStr);
        const dataFinal = new Date(dataFinalStr);

        console.log('Data Inicial:', dataInicial);
        console.log('Data Final:', dataFinal);
        if (isNaN(dataInicial.getTime()) || isNaN(dataFinal.getTime())) {
            throw new BadRequestException('Formato de data inválido. Utilize o formato ISO 8601.');
        }
        return await this.service?.getTrendingFeed(dataInicial, dataFinal);
    }
}