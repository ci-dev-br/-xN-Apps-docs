import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Public } from '@ci/auth/decorators/public.decorator';
import { IndicatorsService } from '../service/indicators.service';

@ApiTags('Análise Fundamentalista')
@Controller('indicators')
export class IndicatorsController {
    constructor(private readonly indicatorsService: IndicatorsService) { }

    @Public()
    @Get(':ticker')
    @Post(':ticker')
    @ApiOperation({ summary: 'Obtém indicadores fundamentalistas (P/L, P/VP) de um ativo na data atual ou especificada' })
    @ApiQuery({ name: 'date', required: false, description: 'Data de referência (YYYY-MM-DD)' })
    @ApiResponse({ status: 200, description: 'Indicadores calculados com sucesso' })
    async getIndicators(
        @Param('ticker') ticker: string,
        @Query('date') dateString?: string,
    ) {
        // Se não passar data, usa a data atual
        const targetDate = dateString ? new Date(dateString) : new Date();

        return this.indicatorsService.getFundamentalIndicators(ticker.toUpperCase(), targetDate);
    }
}