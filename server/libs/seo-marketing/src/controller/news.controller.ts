import { BadRequestException, Controller, Get, Param, Post, Query, Req, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News } from '../models/news.entity';
import { Category } from '../models/category.entity';
import { FeedColumnDto } from '../dto/feed.dto';
import { ScraperService } from '../services/scraper.service';
import { Public } from '@ci/auth/decorators/public.decorator';
import { Policy } from '@ci/core';
interface CacheEntry<T> {
    data: T;
    expiresAt: number;
}

@ApiTags('News')
@Controller('News')
export class NewsController {
    private readonly feedCache = new Map<string, CacheEntry<News[]>>();
    private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

    constructor(
        @InjectRepository(News) private newsRepo: Repository<News>,
        @InjectRepository(Category) private categoryRepo: Repository<Category>,
        private readonly service: ScraperService,
    ) { }

    @Public()
    @Post('getFeed')
    @ApiOperation({ operationId: 'getFeed' })
    @ApiQuery({ name: 'dataInicial', type: String, example: '2026-08-20T00:00:00.000Z', required: false })
    @ApiQuery({ name: 'dataFinal', type: String, example: '2026-08-28T23:59:59.999Z', required: false })
    @ApiResponse({ status: 200, type: [News] })
    async getFeed(
        @Query('dataInicial') dataInicialStr: string,
        @Query('dataFinal') dataFinalStr: string,
        @Query('offset') offset: number = 0,
        @Req() request?: any,
    ) {
        if (!dataInicialStr || !dataFinalStr) {
            throw new BadRequestException('Os parâmetros dataInicial e dataFinal são obrigatórios.');
        }

        const dataInicial = new Date(dataInicialStr);
        const dataFinal = new Date(dataFinalStr);

        if (isNaN(dataInicial.getTime()) || isNaN(dataFinal.getTime())) {
            throw new BadRequestException('Formato de data inválido. Utilize o formato ISO 8601.');
        }

        const isReader = (request?.user?.roles as string[])?.includes('READER') ?? false;
        const limit = isReader ? 30 : 25;
        const cacheKey = `${dataInicial.getTime()}_${dataFinal.getTime()}_${limit}_${offset}`;
        const now = Date.now();

        let rawPosts: News[];
        const cached = this.feedCache.get(cacheKey);

        if (cached && cached.expiresAt > now) {
            rawPosts = cached.data;
        } else {
            rawPosts = (await this.service?.getTrendingFeed(dataInicial, dataFinal, { limit, offset })) || [];
            this.feedCache.set(cacheKey, {
                data: rawPosts,
                expiresAt: now + this.CACHE_TTL_MS,
            });
        }

        return rawPosts.map(post => ({
            ...post,
            content: Policy(
                { reading: post.content },
                request,
                'READER',
                r => r.substring(0, 170) + ' \n\n[...]'
            ).reading,
        }));
    }
}