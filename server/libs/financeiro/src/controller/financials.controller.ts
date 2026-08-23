import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { FinancialsService } from '../service/financials.service';

@ApiTags('Dados Fundamentalistas (CVM)')
@Controller('api/companies/financials')
export class FinancialsController {
    constructor(private readonly financialsService: FinancialsService) { }

    @Post(':ticker/latest')
    @ApiOperation({ summary: 'Obtém o balanço e DRE mais recente de uma empresa pelo ticker' })
    @ApiParam({ name: 'ticker', example: 'PETR4' })
    @ApiResponse({ status: 200, description: 'Dados financeiros retornados com sucesso.' })
    @ApiResponse({ status: 404, description: 'Ativo ou balanço não encontrado.' })
    async getLatest(@Param('ticker') ticker: string) {
        return this.financialsService.getLatestFinancials(ticker.toUpperCase());
    }
}