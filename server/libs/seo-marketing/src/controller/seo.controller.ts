import { BadRequestException, Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { SeoPage } from "../models/seo-page.entity";
import { SeoTarefa, SeoTarefaStatus } from "../models/seo-tarefa.entity";
import { Source } from "../models/source.entity";
import { Category } from "../models/category.entity";
import { SeoAuditService } from "../services/seo-audit.service";
import { SeoMarketingService } from "../seo-marketing.service";
import { SeoTarefaService } from "../services/seo-tarefa.service";
import {
    AuditarPaginaSeoDto,
    DashboardSeoDto,
    MoverTarefaSeoDto,
    ObterDashboardSeoDto,
} from "../dto/dashboard-seo.dto";

@ApiTags('Seo')
@Controller('Seo')
export class SEOController {
    constructor(
        private readonly seoMarketingService: SeoMarketingService,
        private readonly audit: SeoAuditService,
        private readonly tarefaService: SeoTarefaService,
    ) { }

    @Post('GetDashboard')
    @ApiResponse({ type: DashboardSeoDto })
    @ApiOperation({
        operationId: 'GetDashboardSeo',
        summary: 'Obtém a visão geral consolidada do dashboard SEO (KPIs, domínios, páginas, palavras-chave, backlinks, campanhas, tarefas, fontes e tendências) com suporte a segmentação por tenants',
    })
    async getDashboard(
        @Body() input?: ObterDashboardSeoDto,
        @Req() req?: any,
    ): Promise<DashboardSeoDto> {
        return await this.seoMarketingService.obterDashboard(input, req);
    }

    @Post('AuditarPagina')
    @ApiResponse({ type: SeoPage })
    @ApiOperation({
        operationId: 'AuditarPaginaSeo',
        summary: 'Executa auditoria técnica on-page para uma página SEO e gera tarefas automaticamente para apontamentos críticos/alerta',
    })
    async auditarPagina(@Body() input: AuditarPaginaSeoDto): Promise<SeoPage> {
        if (!input?.internalId) {
            throw new BadRequestException('internalId da página é obrigatório.');
        }
        try {
            return await this.audit.auditar(input.internalId);
        } catch (e) {
            throw new BadRequestException((e as Error).message);
        }
    }

    @Post('MoverTarefa')
    @ApiResponse({ type: SeoTarefa })
    @ApiOperation({
        operationId: 'MoverTarefaSeo',
        summary: 'Altera o status de uma tarefa de manutenção SEO',
    })
    async moverTarefa(@Body() input: MoverTarefaSeoDto, @Req() req?: any): Promise<SeoTarefa> {
        if (!input?.internalId || !Object.values(SeoTarefaStatus).includes(input.status)) {
            throw new BadRequestException('internalId e status válido são obrigatórios.');
        }
        return await this.tarefaService.sincronizar({
            internalId: input.internalId,
            status: input.status,
        } as SeoTarefa, req);
    }

    @Post('GetFontes')
    @ApiResponse({ type: Source, isArray: true })
    @ApiOperation({
        operationId: 'GetFontesSeo',
        summary: 'Lista saúde dos crawlers e fontes RSS monitoradas',
    })
    async getFontes(): Promise<Source[]> {
        return await this.seoMarketingService.listarFontes();
    }

    @Post('GetTendencias')
    @ApiResponse({ type: Category, isArray: true })
    @ApiOperation({
        operationId: 'GetTendenciasSeo',
        summary: 'Lista tendências de busca capturadas',
    })
    async getTendencias(): Promise<Category[]> {
        return await this.seoMarketingService.listarTendencias();
    }
}
