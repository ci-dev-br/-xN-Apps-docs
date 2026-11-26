import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SeoDomain } from "../models/seo-domain.entity";
import { SeoPage } from "../models/seo-page.entity";
import { SeoKeyWord } from "../models/seo-key-word.entity";
import { SeoBackLink } from "../models/seo-back-link.entity";
import { SeoCampanha } from "../models/seo-campanha.entity";
import { SeoTarefa, SeoTarefaStatus } from "../models/seo-tarefa.entity";
import { Source } from "../models/source.entity";
import { Category } from "../models/category.entity";
import { SeoAuditService } from "../services/seo-audit.service";
/**
 * Controller Seo Settings
 */
const ControllerName = 'Seo';

/** Recursos expostos pelo CRUD genérico e as relações carregadas em cada listagem. */
type Recurso = 'Dominios' | 'Paginas' | 'PalavrasChave' | 'BackLinks' | 'Campanhas' | 'Tarefas';
const RELACOES: Record<Recurso, string[]> = {
    Dominios: [],
    Paginas: ['dominio', 'campanha', 'palavrasChave'],
    PalavrasChave: ['dominio'],
    BackLinks: ['pagina'],
    Campanhas: ['dominio'],
    Tarefas: ['dominio', 'pagina'],
};
/** Campos gerenciados pelo servidor que não podem ser sobrescritos pelo cliente. */
const CAMPOS_PROTEGIDOS = ['createdAt', 'lastModifiedAt', 'createdBy', 'lastModifiedBy', 'deleted', 'snapshots', 'tenants'];

export class ListarInput { dominioId?: string; }

/*
 * SEO Controller API
 */
@ApiTags(ControllerName)
@Controller(ControllerName)
export class SEOController {
    private readonly repos: Record<Recurso, Repository<any>>;
    constructor(
        @InjectRepository(SeoDomain) dominios: Repository<SeoDomain>,
        @InjectRepository(SeoPage) private readonly paginas: Repository<SeoPage>,
        @InjectRepository(SeoKeyWord) palavras: Repository<SeoKeyWord>,
        @InjectRepository(SeoBackLink) backlinks: Repository<SeoBackLink>,
        @InjectRepository(SeoCampanha) campanhas: Repository<SeoCampanha>,
        @InjectRepository(SeoTarefa) private readonly tarefas: Repository<SeoTarefa>,
        @InjectRepository(Source) private readonly sources: Repository<Source>,
        @InjectRepository(Category) private readonly categories: Repository<Category>,
        private readonly audit: SeoAuditService,
    ) {
        this.repos = {
            Dominios: dominios, Paginas: paginas, PalavrasChave: palavras,
            BackLinks: backlinks, Campanhas: campanhas, Tarefas: tarefas,
        };
    }

    private repo(recurso: string) {
        const r = this.repos[recurso as Recurso];
        if (!r) throw new NotFoundException(`Recurso '${recurso}' inexistente.`);
        return r;
    }

    @ApiOperation({ operationId: `${ControllerName}Dashboard` })
    @Get('Dashboard')
    public async Dashboard() {
        const ativo = '(x.deleted IS NULL OR x.deleted = false)';
        const count = (r: Repository<any>) => r.createQueryBuilder('x').where(ativo).getCount();
        const scoreRow = await this.paginas.createQueryBuilder('x').where(ativo)
            .andWhere('x.score IS NOT NULL').select('AVG(x.score)', 'media').getRawOne();
        const tarefasPorStatus = await this.tarefas.createQueryBuilder('x').where(ativo)
            .select('x.status', 'status').addSelect('COUNT(*)', 'total').groupBy('x.status').getRawMany();
        const piores = await this.paginas.createQueryBuilder('x').where(ativo)
            .andWhere('x.score IS NOT NULL').orderBy('x.score', 'ASC').limit(5).getMany();
        return {
            dominios: await count(this.repos.Dominios),
            paginas: await count(this.paginas),
            palavrasChave: await count(this.repos.PalavrasChave),
            backlinks: await count(this.repos.BackLinks),
            campanhas: await count(this.repos.Campanhas),
            scoreMedio: scoreRow?.media ? Math.round(Number(scoreRow.media)) : null,
            tarefasPorStatus: Object.fromEntries(tarefasPorStatus.map(t => [t.status, Number(t.total)])),
            pioresPaginas: piores,
        };
    }

    @ApiOperation({ operationId: `${ControllerName}Listar` })
    @Post(':recurso/Listar')
    public async Listar(@Param('recurso') recurso: string, @Body() input: ListarInput = {}) {
        const where: any[] = [{ deleted: null }, { deleted: false }];
        if (input?.dominioId && RELACOES[recurso as Recurso]?.includes('dominio'))
            where.forEach(w => w.dominio = { internalId: input.dominioId });
        return this.repo(recurso).find({
            where, relations: RELACOES[recurso as Recurso], order: { createdAt: 'DESC' }, take: 500,
        });
    }

    @ApiOperation({ operationId: `${ControllerName}Salvar` })
    @Post(':recurso/Salvar')
    public async Salvar(@Param('recurso') recurso: string, @Body() body: any) {
        if (!body || typeof body !== 'object') throw new BadRequestException('Corpo inválido.');
        const repo = this.repo(recurso);
        CAMPOS_PROTEGIDOS.forEach(c => delete body[c]);
        // Relações são enviadas apenas como { internalId } — evita gravação em cascata acidental.
        for (const rel of RELACOES[recurso as Recurso]) {
            const v = body[rel];
            if (Array.isArray(v)) body[rel] = v.filter(x => x?.internalId).map(x => ({ internalId: x.internalId }));
            else if (v === '' || v === undefined) body[rel] = v === '' ? null : undefined;
            else if (v && typeof v === 'object') body[rel] = v.internalId ? { internalId: v.internalId } : null;
        }
        const salvo = await repo.save(repo.create(body));
        return repo.findOne({ where: { internalId: (salvo as any).internalId }, relations: RELACOES[recurso as Recurso] });
    }

    @ApiOperation({ operationId: `${ControllerName}Excluir` })
    @Post(':recurso/Excluir/:id')
    public async Excluir(@Param('recurso') recurso: string, @Param('id') id: string) {
        await this.repo(recurso).update({ internalId: id }, { deleted: true });
        return { ok: true };
    }

    @ApiOperation({ operationId: `${ControllerName}AuditarPagina` })
    @Post('Paginas/Auditar/:id')
    public async AuditarPagina(@Param('id') id: string) {
        try {
            return await this.audit.auditar(id);
        } catch (e) {
            throw new BadRequestException((e as Error).message);
        }
    }

    @ApiOperation({ operationId: `${ControllerName}MoverTarefa` })
    @Post('Tarefas/Mover/:id/:status')
    public async MoverTarefa(@Param('id') id: string, @Param('status') status: SeoTarefaStatus) {
        if (!Object.values(SeoTarefaStatus).includes(status)) throw new BadRequestException('Status inválido.');
        await this.tarefas.update({ internalId: id }, { status });
        return { ok: true };
    }

    /** Saúde dos crawlers (fontes RSS usadas pelo ScraperService/DiscoveryService). */
    @ApiOperation({ operationId: `${ControllerName}Fontes` })
    @Get('Fontes')
    public async Fontes() {
        return this.sources.find({ order: { consecutiveErrors: 'DESC', totalRequests: 'DESC' }, take: 200 });
    }

    /** Tendências de busca capturadas do Google Trends. */
    @ApiOperation({ operationId: `${ControllerName}Tendencias` })
    @Get('Tendencias')
    public async Tendencias() {
        return this.categories.find({ where: { isTrending: true }, order: { trendVolume: 'DESC' }, take: 50 });
    }
}
