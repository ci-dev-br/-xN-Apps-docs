import { Controller, Get, Param, Query, BadRequestException, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { InflationService } from './../service/inflation.service';

@ApiTags('Análise Macroeconômica')
@Controller('analysis/inflation')
export class InflationController {
    constructor(private readonly inflationService: InflationService) { }

    @Post(':ticker')
    @ApiOperation({
        summary: 'Ajusta o preço histórico de um ativo pela inflação (IPCA)',
        description: 'Calcula o valor presente de uma ação baseado na inflação acumulada no período, retornando a rentabilidade real vs nominal.'
    })
    @ApiParam({
        name: 'ticker',
        example: 'WEGE3',
        description: 'Ticker do ativo negociado na B3'
    })
    @ApiQuery({
        name: 'startDate',
        required: true,
        example: '2020-01-02',
        description: 'Data de início (compra do ativo) no formato YYYY-MM-DD'
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        example: '2026-08-22',
        description: 'Data final da análise (Opcional, o padrão é a data atual)'
    })
    @ApiResponse({ status: 200, description: 'Cálculo de inflação e rentabilidade retornado com sucesso.' })
    @ApiResponse({ status: 400, description: 'Parâmetros de data inválidos.' })
    @ApiResponse({ status: 404, description: 'Ativo ou cotação inicial não encontrados.' })
    async getInflationAdjustment(
        @Param('ticker') ticker: string,
        @Query('startDate') startDateStr: string,
        @Query('endDate') endDateStr?: string,
    ) {
        // 1. Validação da Data Inicial (Obrigatória)
        if (!startDateStr) {
            throw new BadRequestException('O parâmetro startDate é obrigatório.');
        }

        const startDate = new Date(startDateStr);
        if (isNaN(startDate.getTime())) {
            throw new BadRequestException('Formato de data inicial inválido. Utilize YYYY-MM-DD.');
        }

        // 2. Validação da Data Final (Opcional)
        let endDate = new Date(); // Padrão: data de hoje
        if (endDateStr) {
            endDate = new Date(endDateStr);
            if (isNaN(endDate.getTime())) {
                throw new BadRequestException('Formato de data final inválido. Utilize YYYY-MM-DD.');
            }
        }

        // 3. Validação Lógica
        if (startDate > endDate) {
            throw new BadRequestException('A data inicial não pode ser posterior à data final.');
        }

        // 4. Execução do Serviço
        return this.inflationService.getInflationAdjustedPrice(
            ticker.toUpperCase(), // Garante que o ticker vá em maiúsculo
            startDate,
            endDate
        );
    }
}