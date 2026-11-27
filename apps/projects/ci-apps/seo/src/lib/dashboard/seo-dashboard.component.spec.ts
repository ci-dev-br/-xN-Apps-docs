import { ComponentFixture, TestBed } from '@angular/core/testing';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { SeoDashboardComponent } from './seo-dashboard.component';
import {
  DashboardSeoDto,
  SeoBackLinkService,
  SeoCampanhaService,
  SeoDomainService,
  SeoKeyWordService,
  SeoPageService,
  SeoService,
  SeoTarefaService,
} from '@ci/portal-api';

registerLocaleData(localePt);

describe('SeoDashboardComponent', () => {
  let component: SeoDashboardComponent;
  let fixture: ComponentFixture<SeoDashboardComponent>;

  const mockDashboard: DashboardSeoDto = {
    kpis: {
      totalDominios: 1,
      dominiosVerificados: 1,
      totalPaginas: 1,
      paginasIndexaveis: 1,
      scoreMedio: 88,
      totalPalavrasChave: 1,
      palavrasTop10: 1,
      totalBacklinks: 1,
      backlinksAtivos: 1,
      totalCampanhas: 1,
      campanhasAtivas: 1,
      totalTarefas: 1,
      tarefasAbertas: 1,
      tarefasEmAndamento: 0,
      tarefasConcluidas: 0,
    },
    tarefasPorStatus: {
      ABERTA: 1,
      EM_ANDAMENTO: 0,
      CONCLUIDA: 0,
    },
    dominios: [
      { internalId: 'dom-1', nome: 'Portal CI', hostname: 'apps.ci.dev.br', verificado: true },
    ],
    paginas: [
      { internalId: 'page-1', url: 'https://apps.ci.dev.br/', titulo: 'Apps CI', score: 88, indexavel: true },
    ],
    pioresPaginas: [],
    palavrasChave: [
      { internalId: 'kw-1', termo: 'erp modular', voulePesquisa: 900, posicaoAtual: 5, posicaoAnterior: 9 },
    ],
    backlinks: [
      { internalId: 'bl-1', origemUrl: 'https://github.com/ci', enderecoRetorno: 'https://apps.ci.dev.br/', rel: 'dofollow', ativo: true },
    ],
    campanhas: [
      { internalId: 'camp-1', nome: 'Orgânico Q4', status: 'ATIVA' },
    ],
    tarefas: [
      { internalId: 'task-1', titulo: 'Melhorar LCP', prioridade: 'ALTA', status: 'ABERTA' },
    ],
    fontes: [],
    tendencias: [],
  };

  let seoServiceSpy: jasmine.SpyObj<SeoService>;
  let pageServiceSpy: jasmine.SpyObj<SeoPageService>;

  beforeEach(async () => {
    seoServiceSpy = jasmine.createSpyObj('SeoService', ['getDashboard', 'auditarPagina', 'moverTarefa']);
    seoServiceSpy.getDashboard.and.returnValue(of(mockDashboard));
    seoServiceSpy.auditarPagina.and.returnValue(of(mockDashboard.paginas[0]));
    seoServiceSpy.moverTarefa.and.returnValue(of({ ...mockDashboard.tarefas[0], status: 'CONCLUIDA' }));

    pageServiceSpy = jasmine.createSpyObj('SeoPageService', ['sync', 'delete']);
    pageServiceSpy.sync.and.callFake(({ body }: any) => of({ ...body.data, internalId: 'page-new' }));
    pageServiceSpy.delete.and.callFake(({ body }: any) => of(body));

    await TestBed.configureTestingModule({
      imports: [SeoDashboardComponent],
      providers: [
        provideRouter([]),
        { provide: SeoService, useValue: seoServiceSpy },
        { provide: SeoDomainService, useValue: jasmine.createSpyObj('SeoDomainService', ['sync', 'delete']) },
        { provide: SeoPageService, useValue: pageServiceSpy },
        { provide: SeoKeyWordService, useValue: jasmine.createSpyObj('SeoKeyWordService', ['sync', 'delete']) },
        { provide: SeoBackLinkService, useValue: jasmine.createSpyObj('SeoBackLinkService', ['sync', 'delete']) },
        { provide: SeoCampanhaService, useValue: jasmine.createSpyObj('SeoCampanhaService', ['sync', 'delete']) },
        { provide: SeoTarefaService, useValue: jasmine.createSpyObj('SeoTarefaService', ['sync', 'delete']) },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SeoDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve carregar visão geral do dashboard SEO a partir do backend', () => {
    expect(seoServiceSpy.getDashboard).toHaveBeenCalled();
    expect(component.dominios.length).toBe(1);
    expect(component.paginas.length).toBe(1);
    expect(component.kpis.scoreMedio).toBe(88);
  });

  it('deve segmentar dashboard por tenants selecionados e repassar tenantIds ao backend', () => {
    component.onTenantFilterChange(['tenant-seo-1']);

    expect(seoServiceSpy.getDashboard).toHaveBeenCalledWith({
      body: jasmine.objectContaining({
        tenantIds: ['tenant-seo-1'],
      }),
    });
  });

  it('deve acionar auditoria on-page e movimentação de tarefa via SeoService', () => {
    component.auditarPagina(component.paginas[0]);
    expect(seoServiceSpy.auditarPagina).toHaveBeenCalledWith({ body: { internalId: 'page-1' } });

    component.moverTarefa(component.tarefas[0], 'CONCLUIDA');
    expect(seoServiceSpy.moverTarefa).toHaveBeenCalledWith({
      body: { internalId: 'task-1', status: 'CONCLUIDA' },
    });
  });
});
