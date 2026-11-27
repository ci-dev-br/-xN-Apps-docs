import { Test, TestingModule } from '@nestjs/testing';
import { SeoMarketingService } from './seo-marketing.service';
import { SeoDomainService } from './services/seo-domain.service';
import { SeoPageService } from './services/seo-page.service';
import { SeoKeyWordService } from './services/seo-key-word.service';
import { SeoBackLinkService } from './services/seo-back-link.service';
import { SeoCampanhaService } from './services/seo-campanha.service';
import { SeoTarefaService } from './services/seo-tarefa.service';
import { SeoTarefaStatus } from './models/seo-tarefa.entity';

describe('SeoMarketingService', () => {
  let service: SeoMarketingService;
  let domainService: { obterLista: jest.Mock };
  let pageService: { obterLista: jest.Mock };
  let keyWordService: { obterLista: jest.Mock };
  let backLinkService: { obterLista: jest.Mock };
  let campanhaService: { obterLista: jest.Mock };
  let tarefaService: { obterLista: jest.Mock };

  const mockDomain = {
    internalId: 'dom-1',
    nome: 'Portal CI',
    hostname: 'apps.ci.dev.br',
    verificado: true,
  };

  const mockDomain2 = {
    internalId: 'dom-2',
    nome: 'Blog Técnico',
    hostname: 'blog.ci.dev.br',
    verificado: false,
  };

  const mockPages = [
    {
      internalId: 'page-1',
      url: 'https://apps.ci.dev.br/',
      titulo: 'Apps Plataforma Corporativa',
      score: 92,
      indexavel: true,
      dominio: mockDomain,
    },
    {
      internalId: 'page-2',
      url: 'https://blog.ci.dev.br/post-seo',
      titulo: 'Guia SEO',
      score: 64,
      indexavel: false,
      dominio: mockDomain2,
    },
  ];

  const mockKeywords = [
    {
      internalId: 'kw-1',
      termo: 'plataforma multi-tenant',
      voulePesquisa: 1200,
      posicaoAtual: 4,
      posicaoAnterior: 8,
      dominio: mockDomain,
    },
    {
      internalId: 'kw-2',
      termo: 'nestjs angular cms',
      voulePesquisa: 600,
      posicaoAtual: 18,
      posicaoAnterior: 22,
      dominio: mockDomain2,
    },
  ];

  const mockBacklinks = [
    {
      internalId: 'bl-1',
      origemUrl: 'https://github.com/ci',
      enderecoRetorno: 'https://apps.ci.dev.br/',
      ancora: 'CI Apps',
      rel: 'dofollow',
      ativo: true,
      pagina: mockPages[0],
    },
  ];

  const mockCampanhas = [
    {
      internalId: 'camp-1',
      nome: 'Autoridade Orgânica Q4',
      status: 'ATIVA',
      dominio: mockDomain,
    },
  ];

  const mockTarefas = [
    {
      internalId: 'task-1',
      titulo: '[TITLE_LENGTH] https://blog.ci.dev.br/post-seo',
      codigoIssue: 'TITLE_LENGTH',
      prioridade: 'MEDIA',
      status: SeoTarefaStatus.ABERTA,
      dominio: mockDomain2,
      pagina: mockPages[1],
    },
    {
      internalId: 'task-2',
      titulo: 'Otimizar Core Web Vitals',
      prioridade: 'ALTA',
      status: SeoTarefaStatus.CONCLUIDA,
      dominio: mockDomain,
      pagina: mockPages[0],
    },
  ];

  const mockProvider = (cls: any, data: any[]) => ({
    provide: cls,
    useValue: {
      obterLista: jest.fn().mockResolvedValue(data),
    },
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeoMarketingService,
        mockProvider(SeoDomainService, [mockDomain, mockDomain2]),
        mockProvider(SeoPageService, mockPages),
        mockProvider(SeoKeyWordService, mockKeywords),
        mockProvider(SeoBackLinkService, mockBacklinks),
        mockProvider(SeoCampanhaService, mockCampanhas),
        mockProvider(SeoTarefaService, mockTarefas),
      ],
    }).compile();

    service = module.get<SeoMarketingService>(SeoMarketingService);
    domainService = module.get(SeoDomainService);
    pageService = module.get(SeoPageService);
    keyWordService = module.get(SeoKeyWordService);
    backLinkService = module.get(SeoBackLinkService);
    campanhaService = module.get(SeoCampanhaService);
    tarefaService = module.get(SeoTarefaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('deve consolidar KPIs, piores páginas e tarefas por status no dashboard SEO', async () => {
    const dashboard = await service.obterDashboard({});

    expect(dashboard.kpis.totalDominios).toBe(2);
    expect(dashboard.kpis.dominiosVerificados).toBe(1);
    expect(dashboard.kpis.totalPaginas).toBe(2);
    expect(dashboard.kpis.paginasIndexaveis).toBe(1);
    expect(dashboard.kpis.scoreMedio).toBe(78);
    expect(dashboard.kpis.totalPalavrasChave).toBe(2);
    expect(dashboard.kpis.palavrasTop10).toBe(1);
    expect(dashboard.kpis.totalBacklinks).toBe(1);
    expect(dashboard.kpis.backlinksAtivos).toBe(1);
    expect(dashboard.kpis.totalCampanhas).toBe(1);
    expect(dashboard.kpis.campanhasAtivas).toBe(1);
    expect(dashboard.kpis.totalTarefas).toBe(2);
    expect(dashboard.kpis.tarefasAbertas).toBe(1);
    expect(dashboard.kpis.tarefasConcluidas).toBe(1);
    expect(dashboard.tarefasPorStatus).toEqual({
      ABERTA: 1,
      EM_ANDAMENTO: 0,
      CONCLUIDA: 1,
    });
    expect(dashboard.pioresPaginas[0].internalId).toBe('page-2');
  });

  it('deve filtrar visão do dashboard SEO por dominioId e busca textual', async () => {
    const byDomain = await service.obterDashboard({ dominioId: 'dom-1' });
    expect(byDomain.kpis.totalDominios).toBe(1);
    expect(byDomain.paginas.length).toBe(1);
    expect(byDomain.palavrasChave.length).toBe(1);
    expect(byDomain.backlinks.length).toBe(1);
    expect(byDomain.campanhas.length).toBe(1);
    expect(byDomain.tarefas.length).toBe(1);

    const bySearch = await service.obterDashboard({ search: 'vitals' });
    expect(bySearch.tarefas.length).toBe(1);
    expect(bySearch.tarefas[0].internalId).toBe('task-2');
    expect(bySearch.paginas.length).toBe(0);
  });

  it('deve segmentar consultas por tenantIds, tenantId e header x-tenant-id', async () => {
    await service.obterDashboard({ tenantIds: ['tenant-1', 'tenant-2'] });

    for (const svc of [domainService, pageService, keyWordService, backLinkService, campanhaService, tarefaService]) {
      expect(svc.obterLista).toHaveBeenCalledWith(
        expect.objectContaining({ tenantIds: ['tenant-1', 'tenant-2'] }),
        undefined,
      );
    }

    await service.obterDashboard({}, { headers: { 'x-tenant-id': 'tenant-header-1' } });
    expect(domainService.obterLista).toHaveBeenLastCalledWith(
      expect.objectContaining({ tenantIds: ['tenant-header-1'] }),
      expect.objectContaining({ headers: { 'x-tenant-id': 'tenant-header-1' } }),
    );
  });
});
