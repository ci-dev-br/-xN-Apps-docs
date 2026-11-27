import { Injectable } from '@nestjs/common';
import { SitePostService } from './services/site-post.service';
import { SitePageService } from './services/site-page.service';
import { SiteMediaService } from './services/site-media.service';
import { WebsiteService } from './services/website.service';
import { CommentService } from './services/comment.service';
import { LinksService } from './services/links.service';
import { TermService } from './services/term.service';
import { SiteOptionService } from './services/site-option.service';
import {
    DashboardCmsContentItemDto,
    DashboardCmsDto,
    ObterDashboardCmsDto,
} from './dto/dashboard-cms.dto';
import {
    normalizeCmsStatus,
    SiteContentStatus,
    SiteContentType,
} from './models/cms-enums';
import { SitePost } from './models/site-post.entity';
import { SitePage } from './models/site-page.entity';

function toSlug(text?: string | null): string {
    if (!text) return '';
    return String(text)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function formatDatePtBr(value?: Date | string | null): string {
    if (!value) return 'Em elaboração';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString('pt-BR');
}

/**
 * Serviço consolidador da visão geral do Dashboard CMS
 */
@Injectable()
export class CmsService {
    constructor(
        private readonly sitePostService: SitePostService,
        private readonly sitePageService: SitePageService,
        private readonly siteMediaService: SiteMediaService,
        private readonly websiteService: WebsiteService,
        private readonly commentService: CommentService,
        private readonly linksService: LinksService,
        private readonly termService: TermService,
        private readonly siteOptionService: SiteOptionService,
    ) { }

    private extractTenantIds(input?: ObterDashboardCmsDto, req?: any): string[] {
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

    async obterDashboard(input?: ObterDashboardCmsDto, req?: any): Promise<DashboardCmsDto> {
        const tenantIds = this.extractTenantIds(input, req);
        const tenantOption = tenantIds.length > 0 ? { tenantIds } : {};

        const [
            posts,
            pages,
            media,
            websites,
            comments,
            links,
            terms,
            _options,
        ] = await Promise.all([
            this.sitePostService.obterLista({ ...tenantOption, relations: { website: true, terms: true }, orderBy: { createdAt: 'DESC' } }, req),
            this.sitePageService.obterLista({ ...tenantOption, relations: { website: true }, orderBy: { createdAt: 'DESC' } }, req),
            this.siteMediaService.obterLista({ ...tenantOption, relations: { website: true }, orderBy: { createdAt: 'DESC' } }, req),
            this.websiteService.obterLista({ ...tenantOption, orderBy: { name: 'ASC' } }, req),
            this.commentService.obterLista({ ...tenantOption, relations: { post: true, website: true }, orderBy: { createdAt: 'DESC' } }, req),
            this.linksService.obterLista({ ...tenantOption, relations: { website: true }, orderBy: { createdAt: 'DESC' } }, req),
            this.termService.obterLista({ ...tenantOption, relations: { website: true }, orderBy: { name: 'ASC' } }, req),
            this.siteOptionService.obterLista({ ...tenantOption }, req),
        ]);

        const mapPost = (p: SitePost): DashboardCmsContentItemDto & { _sortTime: number } => {
            const rawType = (p.type || '').toLowerCase();
            const type: SiteContentType =
                rawType === SiteContentType.NOTICE
                    ? SiteContentType.NOTICE
                    : rawType === SiteContentType.PAGE
                        ? SiteContentType.PAGE
                        : SiteContentType.POST;
            const status = normalizeCmsStatus(p.status);
            const refDate = p.publishedAt || p.createdAt;
            const title = (p.title || '').trim() || 'Publicação sem título';
            const firstTerm = Array.isArray(p.terms) && p.terms.length > 0 ? p.terms[0]?.name : undefined;
            return {
                internalId: p.internalId || '',
                sourceEntity: 'SitePost',
                title,
                slug: (p.slug || p.guid || toSlug(title) || 'artigo').replace(/^\/+/, ''),
                type,
                category: (p.category || firstTerm || 'Geral').trim(),
                author: (p.author || 'Editor Portal').trim(),
                publishDate: status === SiteContentStatus.RASCUNHO && !p.publishedAt
                    ? 'Em elaboração'
                    : formatDatePtBr(refDate),
                publishedAt: p.publishedAt || p.createdAt,
                views: Number(p.views || 0),
                status,
                excerpt: (p.excerpt || '').trim(),
                contentHtml: Array.isArray(p.content) ? p.content.join('\n') : '',
                websiteId: p.website?.internalId,
                websiteName: p.website?.name || p.website?.domain,
                tenantIds: Array.isArray((p as any).tenants) ? (p as any).tenants.map((t: any) => t?.id).filter(Boolean) : undefined,
                tenantNames: Array.isArray((p as any).tenants) ? (p as any).tenants.map((t: any) => t?.name || t?.id).filter(Boolean) : undefined,
                _sortTime: refDate ? new Date(refDate).getTime() : 0,
            };
        };

        const mapPage = (pg: SitePage): DashboardCmsContentItemDto & { _sortTime: number } => {
            const status = normalizeCmsStatus(pg.status || SiteContentStatus.PUBLICADO);
            const refDate = pg.publishedAt || pg.createdAt;
            const title = (pg.title || pg.urlMatch || 'Página sem título').trim();
            const rawSlug = pg.slug || (pg.urlMatch ? pg.urlMatch.replace(/^\/+/, '') : '') || toSlug(title) || 'pagina';
            return {
                internalId: pg.internalId || '',
                sourceEntity: 'SitePage',
                title,
                slug: rawSlug,
                type: SiteContentType.PAGE,
                category: (pg.category || 'Institucional').trim(),
                author: (pg.author || 'Editor Portal').trim(),
                publishDate: status === SiteContentStatus.RASCUNHO && !pg.publishedAt
                    ? 'Em elaboração'
                    : formatDatePtBr(refDate),
                publishedAt: pg.publishedAt || pg.createdAt,
                views: Number(pg.views || 0),
                status,
                excerpt: (pg.excerpt || (pg.urlMatch ? `Rota pública: ${pg.urlMatch}` : '')).trim(),
                urlMatch: pg.urlMatch,
                contentHtml: Array.isArray(pg.content) ? pg.content.join('\n') : '',
                websiteId: pg.website?.internalId,
                websiteName: pg.website?.name || pg.website?.domain,
                tenantIds: Array.isArray((pg as any).tenants) ? (pg as any).tenants.map((t: any) => t?.id).filter(Boolean) : undefined,
                tenantNames: Array.isArray((pg as any).tenants) ? (pg as any).tenants.map((t: any) => t?.name || t?.id).filter(Boolean) : undefined,
                _sortTime: refDate ? new Date(refDate).getTime() : 0,
            };
        };

        const websiteFilter = input?.websiteId?.trim();
        const filterByWebsite = <T extends { website?: { internalId?: string } }>(list: T[]) => {
            if (!websiteFilter || websiteFilter === 'todos') return list;
            return list.filter(item => item?.website?.internalId === websiteFilter);
        };

        const filteredPosts = filterByWebsite(posts || []);
        const filteredPages = filterByWebsite(pages || []);
        const filteredMedia = filterByWebsite(media || []);
        const filteredComments = filterByWebsite(comments || []);

        const allContentsWithTime = [
            ...filteredPosts.map(mapPost),
            ...filteredPages.map(mapPage),
        ].sort((a, b) => b._sortTime - a._sortTime);

        const typeFilter = (input?.type || 'todos').toLowerCase();
        const searchNeedle = (input?.search || '').trim().toLowerCase();

        const filteredContents: DashboardCmsContentItemDto[] = allContentsWithTime
            .filter(item => {
                const matchType = typeFilter === 'todos' || item.type === typeFilter;
                const matchSearch = !searchNeedle ||
                    item.title.toLowerCase().includes(searchNeedle) ||
                    item.category.toLowerCase().includes(searchNeedle) ||
                    item.slug.toLowerCase().includes(searchNeedle) ||
                    item.author.toLowerCase().includes(searchNeedle);
                return matchType && matchSearch;
            })
            .map(({ _sortTime, ...rest }) => rest);

        const totalPosts = allContentsWithTime.filter(c => c.type === SiteContentType.POST).length;
        const totalPages = allContentsWithTime.filter(c => c.type === SiteContentType.PAGE).length;
        const totalNotices = allContentsWithTime.filter(c => c.type === SiteContentType.NOTICE).length;
        const totalPublished = allContentsWithTime.filter(c => c.status === SiteContentStatus.PUBLICADO).length;
        const totalDrafts = allContentsWithTime.filter(
            c => c.status === SiteContentStatus.RASCUNHO || c.status === SiteContentStatus.REVISAO,
        ).length;
        const totalViews = allContentsWithTime.reduce((sum, c) => sum + Number(c.views || 0), 0);

        return {
            kpis: {
                totalPosts,
                totalPages,
                totalNotices,
                totalPublished,
                totalDrafts,
                totalViews,
                totalMedia: filteredMedia.length,
                totalComments: filteredComments.length,
                totalWebsites: (websites || []).length,
                totalLinks: filterByWebsite(links || []).length,
                totalTerms: filterByWebsite(terms || []).length,
            },
            contents: filteredContents,
            recentMedia: filteredMedia.slice(0, 12),
            websites: websites || [],
            recentComments: filteredComments.slice(0, 10),
            terms: terms || [],
        };
    }
}
