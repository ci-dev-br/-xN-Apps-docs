import { ApiProperty } from "@nestjs/swagger";
import { SiteMedia } from "../models/site-media.entity";
import { Website } from "../models/website.entity";
import { Comment } from "../models/comment.entity";
import { Term } from "../models/term.entity";
import { SiteContentStatus, SiteContentType } from "../models/cms-enums";

export class ObterDashboardCmsDto {
    @ApiProperty({
        title: 'Website ID',
        description: 'Filtro opcional pelo internalId do website',
        required: false,
        nullable: true,
    })
    websiteId?: string;

    @ApiProperty({
        title: 'Tipo',
        description: 'Filtro opcional por tipo de conteúdo (todos, post, page, notice)',
        enum: ['todos', 'post', 'page', 'notice'],
        required: false,
        nullable: true,
    })
    type?: string;

    @ApiProperty({
        title: 'Busca',
        description: 'Texto opcional para filtrar por título, categoria ou slug',
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

export class DashboardCmsKpisDto {
    @ApiProperty({ title: 'Posts / Artigos', type: 'number' })
    totalPosts: number;

    @ApiProperty({ title: 'Páginas Institucionais', type: 'number' })
    totalPages: number;

    @ApiProperty({ title: 'Comunicados', type: 'number' })
    totalNotices: number;

    @ApiProperty({ title: 'Publicações Ativas', type: 'number' })
    totalPublished: number;

    @ApiProperty({ title: 'Rascunhos / Em Revisão', type: 'number' })
    totalDrafts: number;

    @ApiProperty({ title: 'Visualizações de Conteúdo', type: 'number' })
    totalViews: number;

    @ApiProperty({ title: 'Arquivos de Mídia', type: 'number' })
    totalMedia: number;

    @ApiProperty({ title: 'Comentários', type: 'number' })
    totalComments: number;

    @ApiProperty({ title: 'Websites', type: 'number' })
    totalWebsites: number;

    @ApiProperty({ title: 'Links', type: 'number' })
    totalLinks: number;

    @ApiProperty({ title: 'Termos / Taxonomias', type: 'number' })
    totalTerms: number;
}

export class DashboardCmsContentItemDto {
    @ApiProperty({ type: 'string' })
    internalId: string;

    @ApiProperty({ enum: ['SitePost', 'SitePage'] })
    sourceEntity: 'SitePost' | 'SitePage';

    @ApiProperty({ type: 'string' })
    title: string;

    @ApiProperty({ type: 'string' })
    slug: string;

    @ApiProperty({ enum: SiteContentType })
    type: SiteContentType;

    @ApiProperty({ type: 'string' })
    category: string;

    @ApiProperty({ type: 'string' })
    author: string;

    @ApiProperty({ type: 'string' })
    publishDate: string;

    @ApiProperty({ type: 'string', format: 'date-time', required: false, nullable: true })
    publishedAt?: Date;

    @ApiProperty({ type: 'number' })
    views: number;

    @ApiProperty({ enum: SiteContentStatus })
    status: SiteContentStatus;

    @ApiProperty({ type: 'string' })
    excerpt: string;

    @ApiProperty({ type: 'string', required: false, nullable: true })
    urlMatch?: string;

    @ApiProperty({ type: 'string', required: false, nullable: true })
    contentHtml?: string;

    @ApiProperty({ type: 'string', required: false, nullable: true })
    websiteId?: string;

    @ApiProperty({ type: 'string', required: false, nullable: true })
    websiteName?: string;

    @ApiProperty({ type: String, isArray: true, required: false, nullable: true })
    tenantIds?: string[];

    @ApiProperty({ type: String, isArray: true, required: false, nullable: true })
    tenantNames?: string[];
}

export class DashboardCmsDto {
    @ApiProperty({ type: DashboardCmsKpisDto })
    kpis: DashboardCmsKpisDto;

    @ApiProperty({ type: DashboardCmsContentItemDto, isArray: true })
    contents: DashboardCmsContentItemDto[];

    @ApiProperty({ type: SiteMedia, isArray: true })
    recentMedia: SiteMedia[];

    @ApiProperty({ type: Website, isArray: true })
    websites: Website[];

    @ApiProperty({ type: Comment, isArray: true })
    recentComments: Comment[];

    @ApiProperty({ type: Term, isArray: true })
    terms: Term[];
}
