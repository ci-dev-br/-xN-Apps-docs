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

@ApiTags('News')
@Controller('News')
export class NewsController {
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
        @Query('offset') offset: number,
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
        return (await this.service?.getTrendingFeed(dataInicial, dataFinal, { limit: (request?.user?.roles as string[])?.includes('READER') ? 30 : 25, offset })).map(post => {
            post.content = Policy({ reading: post.content }, request, 'READER', r => r.substring(0, 170) + ' \n\n[...]').reading;
            return post;
        });
    }

}