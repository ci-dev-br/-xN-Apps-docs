import { Injectable, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SeoDomainService } from './services/seo-domain.service';
import { SeoPageService } from './services/seo-page.service';
import { SeoKeyWordService } from './services/seo-key-word.service';
import { SeoBackLinkService } from './services/seo-back-link.service';
import { SeoCampanhaService } from './services/seo-campanha.service';
import { SeoTarefaService } from './services/seo-tarefa.service';
import {
    DashboardSeoDto,
    ObterDashboardSeoDto,
} from './dto/dashboard-seo.dto';
import { SeoTarefaStatus } from './models/seo-tarefa.entity';
import { Source } from './models/source.entity';
import { Category } from './models/category.entity';

function extractTenantIds(input?: { tenantIds?: string[]; tenantId?: string }, req?: any): string[] {
    const ids = new Set<string>();
    if (Array.isArray(input?.tenantIds)) {
        input.tenantIds.forEach(id => {
            if (typeof id === 'string' && id.trim()) ids.add(id.trim());
        });
    }
    if (typeof input?.tenantId === 'string' && input.tenantId.trim()) {
        ids.add(input.tenantId.trim());
    }
    if (ids.size === 0 && req?.headers?.['x-tenant-id']) {
        String(req.headers['x-tenant-id'])
            .split(',')
            .map(s => s.trim())
            .filter(Boolean)
            .forEach(id => ids.add(id));
    }
    return Array.from(ids);
}

/**
 * Serviço consolidador da visão geral do Dashboard SEO & Marketing
 */
@Injectable()
export class SeoMarketingService {
    constructor(
        private readonly domainService: SeoDomainService,
        private readonly pageService: SeoPageService,
        private readonly keyWordService: SeoKeyWordService,
        private readonly backLinkService: SeoBackLinkService,
        private readonly campanhaService: SeoCampanhaService,
        private readonly tarefaService: SeoTarefaService,
        @Optional() @InjectRepository(Source) private readonly sourcesRepo?: Repository<Source>,
        @Optional() @InjectRepository(Category) private readonly categoriesRepo?: Repository<Category>,
    ) { }

    async obterDashboard(input?: ObterDashboardSeoDto, req?: any): Promise<DashboardSeoDto> {
        const tenantIds = extractTenantIds(input, req);
        const tenantOption = tenantIds.length > 0 ? { tenantIds } : {};

        const [
            dominios,
            paginas,
            palavrasChave,
            backlinks,
            campanhas,
            tarefas,
            fontes,
            tendencias,
        ] = await Promise.all([
            this.domainService.obterLista({ ...tenantOption, orderBy: { createdAt: 'DESC' } }, req),
            this.pageService.obterLista({ ...tenantOption, relations: { dominio: true, campanha: true, palavrasChave: true }, orderBy: { createdAt: 'DESC' } }, req),
            this.keyWordService.obterLista({ ...tenantOption, relations: { dominio: true }, orderBy: { createdAt: 'DESC' } }, req),
            this.backLinkService.obterLista({ ...tenantOption, relations: { pagina: { dominio: true } as any }, orderBy: { createdAt: 'DESC' } }, req),
            this.campanhaService.obterLista({ ...tenantOption, relations: { dominio: true }, orderBy: { createdAt: 'DESC' } }, req),
            this.tarefaService.obterLista({ ...tenantOption, relations: { dominio: true, pagina: true }, orderBy: { createdAt: 'DESC' } }, req),
            this.sourcesRepo
                ? this.sourcesRepo.find({ order: { consecutiveErrors: 'DESC', totalRequests: 'DESC' }, take: 100 }).catch(() => [])
                : Promise.resolve([]),
            this.categoriesRepo
                ? this.categoriesRepo.find({ where: { isTrending: true }, order: { trendVolume: 'DESC' }, take: 50 }).catch(() => [])
                : Promise.resolve([]),
        ]);

        const dominioFilter = input?.dominioId?.trim();
        const hasDominioFilter = Boolean(dominioFilter && dominioFilter !== 'todos');
        const searchNeedle = (input?.search || '').trim().toLowerCase();

        const matchDominio = (d?: { internalId?: string } | null) =>
            !hasDominioFilter || d?.internalId === dominioFilter;

        const filteredPaginas = (paginas || []).filter(p => {
            if (!matchDominio(p.dominio)) return false;
            if (!searchNeedle) return true;
            return (
                (p.url || '').toLowerCase().includes(searchNeedle) ||
                (p.titulo || '').toLowerCase().includes(searchNeedle) ||
                (p.metaDescription || '').toLowerCase().includes(searchNeedle)
            );
        });

        const filteredPalavras = (palavrasChave || []).filter(k => {
            if (!matchDominio(k.dominio)) return false;
            if (!searchNeedle) return true;
            return (k.termo || '').toLowerCase().includes(searchNeedle);
        });

        const filteredBacklinks = (backlinks || []).filter(b => {
            if (hasDominioFilter && b.pagina?.dominio?.internalId !== dominioFilter) return false;
            if (!searchNeedle) return true;
            return (
                (b.origemUrl || '').toLowerCase().includes(searchNeedle) ||
                (b.enderecoRetorno || '').toLowerCase().includes(searchNeedle) ||
                (b.ancora || '').toLowerCase().includes(searchNeedle)
            );
        });

        const filteredCampanhas = (campanhas || []).filter(c => {
            if (!matchDominio(c.dominio)) return false;
            if (!searchNeedle) return true;
            return (
                (c.nome || '').toLowerCase().includes(searchNeedle) ||
                (c.objetivo || '').toLowerCase().includes(searchNeedle)
            );
        });

        const filteredTarefas = (tarefas || []).filter(t => {
            if (!matchDominio(t.dominio)) return false;
            if (!searchNeedle) return true;
            return (
                (t.titulo || '').toLowerCase().includes(searchNeedle) ||
                (t.descricao || '').toLowerCase().includes(searchNeedle) ||
                (t.codigoIssue || '').toLowerCase().includes(searchNeedle) ||
                (t.responsavel || '').toLowerCase().includes(searchNeedle)
            );
        });

        const paginasComScore = filteredPaginas.filter(p => p.score !== null && p.score !== undefined);
        const scoreMedio = paginasComScore.length > 0
            ? Math.round(paginasComScore.reduce((acc, p) => acc + Number(p.score || 0), 0) / paginasComScore.length)
            : null;

        const pioresPaginas = [...paginasComScore]
            .sort((a, b) => Number(a.score || 0) - Number(b.score || 0))
            .slice(0, 5);

        const tarefasAbertas = filteredTarefas.filter(t => !t.status || t.status === SeoTarefaStatus.ABERTA).length;
        const tarefasEmAndamento = filteredTarefas.filter(t => t.status === SeoTarefaStatus.EM_ANDAMENTO).length;
        const tarefasConcluidas = filteredTarefas.filter(t => t.status === SeoTarefaStatus.CONCLUIDA).length;

        const dominiosList = dominios || [];
        const dominiosFiltrados = hasDominioFilter
            ? dominiosList.filter(d => d.internalId === dominioFilter)
            : dominiosList;

        return {
            kpis: {
                totalDominios: dominiosFiltrados.length,
                dominiosVerificados: dominiosFiltrados.filter(d => Boolean(d.verificado)).length,
                totalPaginas: filteredPaginas.length,
                paginasIndexaveis: filteredPaginas.filter(p => p.indexavel !== false).length,
                scoreMedio,
                totalPalavrasChave: filteredPalavras.length,
                palavrasTop10: filteredPalavras.filter(k => k.posicaoAtual !== undefined && k.posicaoAtual !== null && k.posicaoAtual > 0 && k.posicaoAtual <= 10).length,
                totalBacklinks: filteredBacklinks.length,
                backlinksAtivos: filteredBacklinks.filter(b => b.ativo !== false).length,
                totalCampanhas: filteredCampanhas.length,
                campanhasAtivas: filteredCampanhas.filter(c => c.status === 'ATIVA').length,
                totalTarefas: filteredTarefas.length,
                tarefasAbertas,
                tarefasEmAndamento,
                tarefasConcluidas,
            },
            tarefasPorStatus: {
                ABERTA: tarefasAbertas,
                EM_ANDAMENTO: tarefasEmAndamento,
                CONCLUIDA: tarefasConcluidas,
            },
            dominios: dominiosList,
            paginas: filteredPaginas,
            pioresPaginas,
            palavrasChave: filteredPalavras,
            backlinks: filteredBacklinks,
            campanhas: filteredCampanhas,
            tarefas: filteredTarefas,
            fontes: fontes || [],
            tendencias: tendencias || [],
        };
    }

    async listarFontes(): Promise<Source[]> {
        if (!this.sourcesRepo) return [];
        return this.sourcesRepo.find({ order: { consecutiveErrors: 'DESC', totalRequests: 'DESC' }, take: 200 });
    }

    async listarTendencias(): Promise<Category[]> {
        if (!this.categoriesRepo) return [];
        return this.categoriesRepo.find({ where: { isTrending: true }, order: { trendVolume: 'DESC' }, take: 50 });
    }
}
