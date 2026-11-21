import { Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '@ci/auth/decorators/public.decorator';

import { MacroIndicator } from '../model/macro-indicator.entity'; // Apenas para tipagem do Swagger
import { MacroIndicatorsService } from '../service/macro-indicators.service';
import { BcbScraperService } from '../service/bcb-scraper.service';
import { ScraperService } from '../service/scraper.service';

@ApiTags('Indicadores Macroeconômicos')
@Controller('api/macro-indicators')
export class MacroIndicatorsController {
    constructor(
        private readonly macroService: MacroIndicatorsService,
        private readonly bcbScraperService: BcbScraperService,
        private readonly scraperService: ScraperService,
    ) { }

    @Public()
    @Get('latest')
    @Post('latest')
    @ApiOperation({
        summary: 'Obtém os últimos indicadores',
        description: 'Retorna a cotação/valor mais recente registrada para cada indicador (Selic, CDI, IPCA, IGP-M, Dólar, Euro, Poupança) com fonte e data de extração.'
    })
    @ApiResponse({
        status: 200,
        description: 'Lista com o último valor de cada indicador',
        type: [MacroIndicator]
    })
    async getLatest(): Promise<MacroIndicator[]> {
        return this.macroService.getLatestIndicators();
    }

    @Post('sync')
    @HttpCode(HttpStatus.ACCEPTED)
    @ApiOperation({
        summary: 'Força a sincronização dos indicadores macro e microeconômicos',
        description: 'Aciona manualmente a coleta atualizada de macroindicadores (BCB/Câmbio) e microindicadores (cotações B3).'
    })
    @ApiResponse({ status: 202, description: 'Sincronização iniciada em background.' })
    triggerSync() {
        Promise.allSettled([
            this.bcbScraperService.fetchMacroIndicators(true),
            this.scraperService.fetchDailyQuotes(true),
        ]).catch(err => {
            console.error('Erro na sincronização manual:', err);
        });

        return { message: 'Sincronização de indicadores macro e micro iniciada em background. Acompanhe os logs do servidor.' };
    }
}
