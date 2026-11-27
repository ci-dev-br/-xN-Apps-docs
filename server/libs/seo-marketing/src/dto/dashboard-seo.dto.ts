import { ApiProperty } from "@nestjs/swagger";
import { SeoDomain } from "../models/seo-domain.entity";
import { SeoPage } from "../models/seo-page.entity";
import { SeoKeyWord } from "../models/seo-key-word.entity";
import { SeoBackLink } from "../models/seo-back-link.entity";
import { SeoCampanha } from "../models/seo-campanha.entity";
import { SeoTarefa, SeoTarefaStatus } from "../models/seo-tarefa.entity";
import { Source } from "../models/source.entity";
import { Category } from "../models/category.entity";

export class ObterDashboardSeoDto {
    @ApiProperty({
        title: 'Domínio ID',
        description: 'Filtro opcional pelo internalId do domínio SEO (ou "todos")',
        required: false,
        nullable: true,
    })
    dominioId?: string;

    @ApiProperty({
        title: 'Busca',
        description: 'Texto opcional para filtrar páginas, palavras-chave, backlinks, campanhas e tarefas',
        required: false,
        nullable: true,
    })
    search?: string;

    @ApiProperty({
        title: 'Tenants IDs',
        description: 'Lista opcional de IDs de tenants para segmentação da visão do dashboard',
        type: String,
        isArray: true,
        required: false,
        nullable: true,
    })
    tenantIds?: string[];

    @ApiProperty({
        title: 'Tenant ID',
        description: 'ID único opcional de tenant para segmentação',
        required: false,
        nullable: true,
    })
    tenantId?: string;
}

export class AuditarPaginaSeoDto {
    @ApiProperty({
        title: 'Internal ID da Página',
        description: 'Identificador interno da página SEO a ser auditada',
    })
    internalId: string;
}

export class MoverTarefaSeoDto {
    @ApiProperty({
        title: 'Internal ID da Tarefa',
        description: 'Identificador interno da tarefa SEO',
    })
    internalId: string;

    @ApiProperty({
        title: 'Novo Status',
        enum: SeoTarefaStatus,
    })
    status: SeoTarefaStatus;
}

export class DashboardSeoKpisDto {
    @ApiProperty({ title: 'Domínios Monitorados', type: 'number' })
    totalDominios: number;

    @ApiProperty({ title: 'Domínios Verificados', type: 'number' })
    dominiosVerificados: number;

    @ApiProperty({ title: 'Páginas Monitoradas', type: 'number' })
    totalPaginas: number;

    @ApiProperty({ title: 'Páginas Indexáveis', type: 'number' })
    paginasIndexaveis: number;

    @ApiProperty({ title: 'Score Médio On-Page', type: 'number', nullable: true })
    scoreMedio: number | null;

    @ApiProperty({ title: 'Palavras-chave Monitoradas', type: 'number' })
    totalPalavrasChave: number;

    @ApiProperty({ title: 'Palavras no Top 10 SERP', type: 'number' })
    palavrasTop10: number;

    @ApiProperty({ title: 'Backlinks Registrados', type: 'number' })
    totalBacklinks: number;

    @ApiProperty({ title: 'Backlinks Ativos', type: 'number' })
    backlinksAtivos: number;

    @ApiProperty({ title: 'Campanhas SEO', type: 'number' })
    totalCampanhas: number;

    @ApiProperty({ title: 'Campanhas Ativas', type: 'number' })
    campanhasAtivas: number;

    @ApiProperty({ title: 'Total de Tarefas', type: 'number' })
    totalTarefas: number;

    @ApiProperty({ title: 'Tarefas Abertas', type: 'number' })
    tarefasAbertas: number;

    @ApiProperty({ title: 'Tarefas em Andamento', type: 'number' })
    tarefasEmAndamento: number;

    @ApiProperty({ title: 'Tarefas Concluídas', type: 'number' })
    tarefasConcluidas: number;
}

export class DashboardSeoTarefasPorStatusDto {
    @ApiProperty({ type: 'number' })
    ABERTA: number;

    @ApiProperty({ type: 'number' })
    EM_ANDAMENTO: number;

    @ApiProperty({ type: 'number' })
    CONCLUIDA: number;
}

export class DashboardSeoDto {
    @ApiProperty({ type: DashboardSeoKpisDto })
    kpis: DashboardSeoKpisDto;

    @ApiProperty({ type: DashboardSeoTarefasPorStatusDto })
    tarefasPorStatus: DashboardSeoTarefasPorStatusDto;

    @ApiProperty({ type: SeoDomain, isArray: true })
    dominios: SeoDomain[];

    @ApiProperty({ type: SeoPage, isArray: true })
    paginas: SeoPage[];

    @ApiProperty({ type: SeoPage, isArray: true })
    pioresPaginas: SeoPage[];

    @ApiProperty({ type: SeoKeyWord, isArray: true })
    palavrasChave: SeoKeyWord[];

    @ApiProperty({ type: SeoBackLink, isArray: true })
    backlinks: SeoBackLink[];

    @ApiProperty({ type: SeoCampanha, isArray: true })
    campanhas: SeoCampanha[];

    @ApiProperty({ type: SeoTarefa, isArray: true })
    tarefas: SeoTarefa[];

    @ApiProperty({ type: Source, isArray: true })
    fontes: Source[];

    @ApiProperty({ type: Category, isArray: true })
    tendencias: Category[];
}
