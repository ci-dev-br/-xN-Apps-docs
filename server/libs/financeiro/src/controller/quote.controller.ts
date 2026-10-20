import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Public } from '@ci/auth/decorators/public.decorator';
import { QuotesService } from '../service/quotes.services';
@ApiTags('Cotações (B3)')
@Controller('api/quotes')
export class QuotesController {
    constructor(private readonly quotesService: QuotesService) { }

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
    @ApiResponse({ status: 200, description: 'Lista de cotações com variação percentual.' })
    async getRecent(
        @Param('ticker') ticker: string,
        @Query('days') days?: string,
    ) {
        const limit = days ? parseInt(days, 10) : 5;
        return this.quotesService.getRecentQuotes(ticker.toUpperCase(), limit);
    }
}