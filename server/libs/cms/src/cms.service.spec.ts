import { Test, TestingModule } from '@nestjs/testing';
import { CmsService } from './cms.service';
import { SitePostService } from './services/site-post.service';
import { SitePageService } from './services/site-page.service';
import { SiteMediaService } from './services/site-media.service';
import { WebsiteService } from './services/website.service';
import { CommentService } from './services/comment.service';
import { LinksService } from './services/links.service';
import { TermService } from './services/term.service';
import { SiteOptionService } from './services/site-option.service';
import { SiteContentStatus, SiteContentType } from './models/cms-enums';

describe('CmsService', () => {
  let service: CmsService;

  const mockWebsite = {
    internalId: 'web-1',
    name: 'Portal Principal',
    domain: 'apps.ci.dev.br',
  };

  const mockPosts = [
    {
      internalId: 'post-1',
      title: 'Lançamento Cloud 3.0',
      slug: 'lancamento-cloud-3-0',
      type: SiteContentType.POST,
      category: 'Tecnologia',
      author: 'Equipe Engenharia',
      status: 'publish', // legado deve normalizar para 'publicado'
      views: 3420,
      excerpt: 'Novos recursos de segurança.',
      publishedAt: new Date('2026-10-19T12:00:00Z'),
      website: mockWebsite,
    },
    {
      internalId: 'post-2',
      title: 'Comunicado de Manutenção',
      slug: 'comunicado-manutencao',
      type: SiteContentType.NOTICE,
      category: 'Infraestrutura',
      author: 'DevOps',
      status: SiteContentStatus.RASCUNHO,
      views: 150,
      excerpt: 'Janela preventiva no cluster.',
      createdAt: new Date('2026-10-20T12:00:00Z'),
    },
  ];

  const mockPages = [
    {
      internalId: 'page-1',
      title: 'Política de Privacidade',
      urlMatch: '/politica-privacidade',
      category: 'Institucional',
      author: 'Compliance',
      status: SiteContentStatus.PUBLICADO,
      views: 1280,
      publishedAt: new Date('2026-10-15T12:00:00Z'),
      website: mockWebsite,
    },
  ];

  const mockMedia = [
    {
      internalId: 'media-1',
      filename: 'banner-portal.png',
      url: 'assets/banner-portal.png',
      mediaType: 'image',
      sizeLabel: '1.2 MB',
      website: mockWebsite,
    },
  ];

  const listProvider = (cls: any, data: any[] = []) => ({
    provide: cls,
    useValue: {
      obterLista: jest.fn().mockResolvedValue(data),
    },
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CmsService,
        listProvider(SitePostService, mockPosts),
        listProvider(SitePageService, mockPages),
        listProvider(SiteMediaService, mockMedia),
        listProvider(WebsiteService, [mockWebsite]),
        listProvider(CommentService, [{ internalId: 'cmt-1', author: 'Leitor' }]),
        listProvider(LinksService, [{ internalId: 'lnk-1', name: 'Docs', url: 'https://docs.ci.dev.br' }]),
        listProvider(TermService, [{ internalId: 'trm-1', name: 'Tecnologia', slug: 'tecnologia' }]),
        listProvider(SiteOptionService, []),
      ],
    }).compile();

    service = module.get<CmsService>(CmsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('deve consolidar KPIs, conteúdos de posts/páginas, mídias e normalizar status legados', async () => {
    const dashboard = await service.obterDashboard({});

    expect(dashboard.kpis.totalPosts).toBe(1);
    expect(dashboard.kpis.totalPages).toBe(1);
    expect(dashboard.kpis.totalNotices).toBe(1);
    expect(dashboard.kpis.totalPublished).toBe(2);
    expect(dashboard.kpis.totalDrafts).toBe(1);
    expect(dashboard.kpis.totalViews).toBe(4850);
    expect(dashboard.kpis.totalMedia).toBe(1);
    expect(dashboard.kpis.totalComments).toBe(1);
    expect(dashboard.kpis.totalWebsites).toBe(1);
    expect(dashboard.kpis.totalLinks).toBe(1);
    expect(dashboard.kpis.totalTerms).toBe(1);

    expect(dashboard.contents.length).toBe(3);
    const legacyPost = dashboard.contents.find(c => c.internalId === 'post-1');
    expect(legacyPost?.status).toBe(SiteContentStatus.PUBLICADO);
    expect(legacyPost?.sourceEntity).toBe('SitePost');

    const pageItem = dashboard.contents.find(c => c.internalId === 'page-1');
    expect(pageItem?.sourceEntity).toBe('SitePage');
    expect(pageItem?.slug).toBe('politica-privacidade');
  });

  it('deve filtrar conteúdos por websiteId, tipo e busca textual', async () => {
    const byWebsite = await service.obterDashboard({ websiteId: 'web-1' });
    expect(byWebsite.contents.length).toBe(2);

    const byType = await service.obterDashboard({ type: 'notice' });
    expect(byType.contents.length).toBe(1);
    expect(byType.contents[0].internalId).toBe('post-2');

    const bySearch = await service.obterDashboard({ search: 'privacidade' });
    expect(bySearch.contents.length).toBe(1);
    expect(bySearch.contents[0].internalId).toBe('page-1');
  });

  it('deve repassar tenantIds para os serviços de domínio na segmentação por tenants', async () => {
    await service.obterDashboard({ tenantIds: ['t-1', 't-2'] });
    const postSvc = (service as any).sitePostService;
    expect(postSvc.obterLista).toHaveBeenCalledWith(
      expect.objectContaining({ tenantIds: ['t-1', 't-2'] }),
      undefined,
    );
  });
});
