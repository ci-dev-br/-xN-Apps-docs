import { ComponentFixture, TestBed } from '@angular/core/testing';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { CmsDashboardComponent } from './cms-dashboard.component';
import {
  CmsService,
  DashboardCmsDto,
  SiteMediaService,
  SitePageService,
  SitePostService,
} from '@ci/portal-api';

registerLocaleData(localePt);

describe('CmsDashboardComponent', () => {
  let component: CmsDashboardComponent;
  let fixture: ComponentFixture<CmsDashboardComponent>;

  const mockDashboard: DashboardCmsDto = {
    kpis: {
      totalPosts: 1,
      totalPages: 1,
      totalNotices: 0,
      totalPublished: 2,
      totalDrafts: 0,
      totalViews: 4700,
      totalMedia: 1,
      totalComments: 3,
      totalWebsites: 1,
      totalLinks: 2,
      totalTerms: 4,
    },
    contents: [
      {
        internalId: 'post-1',
        sourceEntity: 'SitePost',
        title: 'Lançamento Cloud 3.0',
        slug: 'lancamento-cloud-3-0',
        type: 'post',
        category: 'Tecnologia',
        author: 'Equipe Engenharia',
        publishDate: '19/10/2026',
        views: 3420,
        status: 'publicado',
        excerpt: 'Novos recursos de segurança.',
        websiteId: 'web-1',
        websiteName: 'Portal Principal',
      },
      {
        internalId: 'page-1',
        sourceEntity: 'SitePage',
        title: 'Política de Privacidade',
        slug: 'politica-privacidade',
        urlMatch: '/politica-privacidade',
        type: 'page',
        category: 'Institucional',
        author: 'Compliance',
        publishDate: '15/10/2026',
        views: 1280,
        status: 'publicado',
        excerpt: 'Documentação LGPD.',
        websiteId: 'web-1',
        websiteName: 'Portal Principal',
      },
    ],
    recentMedia: [
      {
        internalId: 'media-1',
        filename: 'banner-portal.png',
        url: 'assets/banner-portal.png',
        mediaType: 'image',
        sizeLabel: '1.2 MB',
      },
    ],
    websites: [
      {
        internalId: 'web-1',
        name: 'Portal Principal',
        domain: 'apps.ci.dev.br',
      },
    ],
    recentComments: [],
    terms: [],
  };

  let cmsServiceSpy: jasmine.SpyObj<CmsService>;
  let sitePostServiceSpy: jasmine.SpyObj<SitePostService>;
  let sitePageServiceSpy: jasmine.SpyObj<SitePageService>;
  let siteMediaServiceSpy: jasmine.SpyObj<SiteMediaService>;

  beforeEach(async () => {
    cmsServiceSpy = jasmine.createSpyObj('CmsService', ['getDashboard']);
    cmsServiceSpy.getDashboard.and.returnValue(of(mockDashboard));

    sitePostServiceSpy = jasmine.createSpyObj('SitePostService', ['sync', 'delete']);
    sitePostServiceSpy.sync.and.callFake(({ body }: any) =>
      of({ ...body.data, internalId: body.data.internalId || 'post-new' }),
    );
    sitePostServiceSpy.delete.and.callFake(({ body }: any) => of(body));

    sitePageServiceSpy = jasmine.createSpyObj('SitePageService', ['sync', 'delete']);
    sitePageServiceSpy.sync.and.callFake(({ body }: any) =>
      of({ ...body.data, internalId: body.data.internalId || 'page-new' }),
    );
    sitePageServiceSpy.delete.and.callFake(({ body }: any) => of(body));

    siteMediaServiceSpy = jasmine.createSpyObj('SiteMediaService', ['sync', 'delete']);
    siteMediaServiceSpy.sync.and.callFake(({ body }: any) =>
      of({ ...body.data, internalId: body.data.internalId || 'media-new' }),
    );
    siteMediaServiceSpy.delete.and.callFake(({ body }: any) => of(body));

    await TestBed.configureTestingModule({
      imports: [CmsDashboardComponent],
      providers: [
        provideRouter([]),
        { provide: CmsService, useValue: cmsServiceSpy },
        { provide: SitePostService, useValue: sitePostServiceSpy },
        { provide: SitePageService, useValue: sitePageServiceSpy },
        { provide: SiteMediaService, useValue: siteMediaServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CmsDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve carregar visão geral do dashboard CMS a partir do backend', () => {
    expect(cmsServiceSpy.getDashboard).toHaveBeenCalled();
    expect(component.contents.length).toBe(2);
    expect(component.recentMedia.length).toBe(1);
    expect(component.totalPosts).toBe(1);
    expect(component.totalPages).toBe(1);
    expect(component.totalViews).toBe(4700);
  });

  it('deve persistir criação de novo post via SitePostService.sync', () => {
    component.openNewModal();
    component.contentForm.title = 'Novo Artigo Técnico';
    component.contentForm.type = 'post';
    component.contentForm.status = 'publicado';
    component.generateSlug();

    component.saveContent();

    expect(sitePostServiceSpy.sync).toHaveBeenCalledWith({
      body: {
        data: jasmine.objectContaining({
          title: 'Novo Artigo Técnico',
          slug: 'novo-artigo-tecnico',
          type: 'post',
          status: 'publicado',
        }),
      },
    });
  });

  it('deve persistir criação de nova página via SitePageService.sync', () => {
    component.openNewModal();
    component.contentForm.type = 'page';
    component.contentForm.title = 'Sobre Nós';
    component.generateSlug();

    component.saveContent();

    expect(sitePageServiceSpy.sync).toHaveBeenCalledWith({
      body: {
        data: jasmine.objectContaining({
          title: 'Sobre Nós',
          slug: 'sobre-nos',
          urlMatch: '/sobre-nos',
        }),
      },
    });
  });

  it('deve alternar status de publicação persistindo na entidade correspondente', () => {
    const postItem = component.contents[0];
    component.togglePublish(postItem);
    expect(sitePostServiceSpy.sync).toHaveBeenCalledWith({
      body: {
        data: jasmine.objectContaining({
          internalId: 'post-1',
          status: 'rascunho',
        }),
      },
    });

    const pageItem = component.contents[1];
    component.togglePublish(pageItem);
    expect(sitePageServiceSpy.sync).toHaveBeenCalledWith({
      body: {
        data: jasmine.objectContaining({
          internalId: 'page-1',
          status: 'rascunho',
        }),
      },
    });
  });

  it('deve cadastrar nova mídia via SiteMediaService.sync', () => {
    component.openNewMediaModal();
    component.mediaForm.filename = 'capa.png';
    component.mediaForm.url = 'https://cdn.ci.dev.br/capa.png';
    component.mediaForm.mediaType = 'image';

    component.saveMedia();

    expect(siteMediaServiceSpy.sync).toHaveBeenCalledWith({
      body: {
        data: jasmine.objectContaining({
          filename: 'capa.png',
          url: 'https://cdn.ci.dev.br/capa.png',
          mediaType: 'image',
        }),
      },
    });
  });

  it('deve segmentar dashboard CMS por tenants selecionados', () => {
    component.onTenantFilterChange(['tenant-cms-1', 'tenant-cms-2']);
    expect(cmsServiceSpy.getDashboard).toHaveBeenCalledWith({
      body: jasmine.objectContaining({
        tenantIds: ['tenant-cms-1', 'tenant-cms-2'],
      }),
    });
  });
});
