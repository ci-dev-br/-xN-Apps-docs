import { Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { MacroIndicator } from '../model/macro-indicator.entity'; // Apenas para tipagem do Swagger
import { MacroIndicatorsService } from '../service/macro-indicators.service';
import { BcbScraperService } from '../service/bcb-scraper.service';

@ApiTags('Indicadores Macroeconômicos')
@Controller('api/macro-indicators')
export class MacroIndicatorsController {
    constructor(
        private readonly macroService: MacroIndicatorsService,
        private readonly bcbScraperService: BcbScraperService,
    ) { }

    @Post('latest')
    @ApiOperation({
        summary: 'Obtém os últimos indicadores',
        description: 'Retorna a cotação/valor mais recente registrada no banco para cada indicador (Selic, Dólar, IPCA, etc).'
    })
    @ApiResponse({
        status: 200,
        description: 'Lista com o último valor de cada indicador',
        type: [MacroIndicator] // Ajuda o Swagger a documentar o formato do JSON de saída
    })
    async getLatest(): Promise<MacroIndicator[]> {
        return this.macroService.getLatestIndicators();
    }

    @Post('sync')
    @HttpCode(HttpStatus.ACCEPTED) // Retorna 202 Accepted (A requisição foi aceita para processamento)
    @ApiOperation({
        summary: 'Força a sincronização dos dados do Banco Central',
        description: 'Aciona manualmente a rotina do Scraper para baixar os últimos 60 dias de indicadores.'
    })
    @ApiResponse({ status: 202, description: 'Sincronização iniciada em background.' })
    triggerSync() {
        // Importante: NÃO usamos "await" aqui! 
        // Como a API do BCB pode demorar, iniciamos o processo em background e 
        // liberamos a resposta da requisição HTTP imediatamente.
        this.bcbScraperService.fetchMacroIndicators().catch(err => {
            console.error('Erro na sincronização manual:', err);
        });

        return { message: 'Sincronização do BCB iniciada em background. Acompanhe os logs do servidor.' };
    }
}