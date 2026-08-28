import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News } from '../models/news.entity';
import { Category } from '../models/category.entity';

@ApiTags('News Agreggator')
@Controller('news')
export class NewsController {
    constructor(
        @InjectRepository(News) private newsRepo: Repository<News>,
        @InjectRepository(Category) private categoryRepo: Repository<Category>,
    ) { }

    @Get('categories')
    @ApiOperation({ summary: 'Lista todas as categorias catalogadas' })
    @ApiResponse({ status: 200, type: [Category] })
    async getCategories() {
        return this.categoryRepo.find({ order: { isTrending: 'DESC' } });
    }

    @Get(':categoryId')
    @ApiOperation({ summary: 'Busca notícias por categoria' })
    @ApiResponse({ status: 200, type: [News] })
    async getNewsByCategory(@Param('categoryId') categoryId: string) {
        return this.newsRepo.find({
            where: { category: { id: categoryId } },
            order: { scrapedAt: 'DESC' },
            take: 50
        });
    }
}