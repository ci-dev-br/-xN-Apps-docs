import { Controller, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Public } from '@ci/auth/decorators/public.decorator';
import { QuotesService } from '../service/quotes.services';
import { ScraperService } from '../service/scraper.service';

@ApiTags('Cotações (B3)')
@Controller('api/quotes')
export class QuotesController {
    constructor(
        private readonly quotesService: QuotesService,
        private readonly scraperService: ScraperService,
    ) { }

    @Public()
    @Get(':ticker/recent')
    @Post(':ticker/recent')
    @ApiOperation({ summary: 'Obtém as cotações mais recentes com cálculo de variação diária' })
    @ApiParam({ name: 'ticker', example: 'WEGE3' })
    @ApiQuery({
        name: 'days',
        required: false,
        type: Number,
        description: 'Quantidade de dias a retornar (Padrão: 5)'
    })
    @ApiResponse({ status: 200, description: 'Lista de cotações com variação percentual e data de extração.' })
    async getRecent(
        @Param('ticker') ticker: string,
        @Query('days') days?: string,
    ) {
        const limit = days ? parseInt(days, 10) : 5;
        return this.quotesService.getRecentQuotes(ticker.toUpperCase(), limit);
    }

    @Post('sync')
    @HttpCode(HttpStatus.ACCEPTED)
    @ApiOperation({
        summary: 'Força a sincronização das cotações da B3',
        description: 'Aciona manualmente a coleta atualizada dos ativos e índices da B3.'
    })
    @ApiResponse({ status: 202, description: 'Sincronização das cotações iniciada em background.' })
    triggerSync() {
        this.scraperService.fetchDailyQuotes(true).catch(err => {
            console.error('Erro na sincronização manual de cotações:', err);
        });

        return { message: 'Sincronização das cotações da B3 iniciada em background.' };
    }
}
