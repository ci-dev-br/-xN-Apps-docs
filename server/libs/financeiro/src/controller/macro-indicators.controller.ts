import { Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Public } from '@ci/auth/decorators/public.decorator';

import { MacroIndicator } from '../model/macro-indicator.entity';
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
        summary: 'Obtém os últimos indicadores macroeconômicos',
        description: 'Retorna a cotação/valor mais recente registrada na base para cada indicador (Selic, CDI, IPCA, IGP-M, Dólar, Euro, Poupança) com fonte, data de extração na fonte (extractedAt) e data da consulta na base (queriedAt).'
    })
    @ApiQuery({ name: 'includeCrypto', required: false, type: Boolean, description: 'Quando true, inclui índices e cotações de criptomoedas.' })
    @ApiResponse({
        status: 200,
        description: 'Lista com o último valor de cada indicador',
        type: [MacroIndicator]
    })
    async getLatest(@Query('includeCrypto') includeCrypto?: string): Promise<MacroIndicator[]> {
        return this.macroService.getLatestIndicators({
            includeCrypto: includeCrypto === 'true' || includeCrypto === '1',
        });
    }

    @Public()
    @Get('crypto')
    @Post('crypto')
    @ApiOperation({
        summary: 'Obtém índices e cotações públicas de criptomoedas',
        description: 'Retorna cotações e índices cripto (BTC, ETH, SOL, BNB, XRP, ADA, DOGE, Medo & Ganância, Dominância BTC e Market Cap) via APIs públicas (CoinGecko, Alternative.me, AwesomeAPI, Binance) com extractedAt e queriedAt.'
    })
    @ApiResponse({
        status: 200,
        description: 'Lista com o último valor de cada índice cripto',
        type: [MacroIndicator]
    })
    async getCrypto(): Promise<MacroIndicator[]> {
        return this.macroService.getCryptoIndicators();
    }

    @Post('sync')
    @HttpCode(HttpStatus.ACCEPTED)
    @ApiOperation({
        summary: 'Força a sincronização dos indicadores macro, cripto e microeconômicos',
        description: 'Aciona manualmente a coleta atualizada de macroindicadores (BCB/Câmbio), índices cripto e microindicadores (cotações B3).'
    })
    @ApiResponse({ status: 202, description: 'Sincronização iniciada em background.' })
    triggerSync() {
        Promise.allSettled([
            this.bcbScraperService.fetchMacroIndicators(true),
            this.scraperService.fetchDailyQuotes(true),
        ]).catch(err => {
            console.error('Erro na sincronização manual:', err);
        });

        return { message: 'Sincronização de indicadores macro, cripto e micro iniciada em background. Acompanhe os logs do servidor.' };
    }
}
