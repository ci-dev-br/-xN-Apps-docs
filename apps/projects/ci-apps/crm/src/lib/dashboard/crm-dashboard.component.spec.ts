import { ComponentFixture, TestBed } from '@angular/core/testing';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { CrmDashboardComponent } from './crm-dashboard.component';
import {
  AtividadeCrmService,
  CrmService,
  DashboardCrmDto,
  OportunidadeService,
} from '@ci/portal-api';

registerLocaleData(localePt);

describe('CrmDashboardComponent', () => {
  let component: CrmDashboardComponent;
  let fixture: ComponentFixture<CrmDashboardComponent>;

  const mockDashboard: DashboardCrmDto = {
    kpis: {
      pipelineAtivo: 145000,
      totalGanho: 120000,
      oportunidadesEmAberto: 1,
      totalOportunidades: 2,
      oportunidadesGanhas: 1,
      oportunidadesPerdidas: 0,
      taxaConversao: 50,
      ticketMedio: 120000,
      cicloMedioDias: 10,
      atividadesPendentes: 1,
      atividadesConcluidas: 0,
    },
    contadores: {
      clientes: 3,
      atendimentos: 2,
      agendamentos: 1,
      historicoContatos: 4,
      produtos: 5,
      servicos: 2,
      promocoes: 1,
      campanhas: 1,
      profissionais: 2,
      vendasProdutos: 0,
      pagamentos: 1,
    },
    etapas: [],
    oportunidades: [
      {
        internalId: 'opp-1',
        titulo: 'Implantação Portal Corporativo',
        clienteNome: 'Acme Seguros S.A.',
        valor: 145000,
        estagio: 'negociacao',
        probabilidade: 80,
        responsavel: 'Roberto Silva',
        prioridade: 'alta',
      },
      {
        internalId: 'opp-2',
        titulo: 'Módulo LMS',
        clienteNome: 'Rede Farma',
        valor: 120000,
        estagio: 'ganho',
        probabilidade: 100,
        responsavel: 'Juliana Costa',
        prioridade: 'media',
      },
    ],
    atividades: [
      {
        internalId: 'act-1',
        tipo: 'meeting',
        titulo: 'Apresentação comercial',
        clienteNome: 'Acme Seguros S.A.',
        prazoTexto: 'Hoje às 15:00',
        status: 'pending',
      },
    ],
    responsaveis: ['Juliana Costa', 'Roberto Silva'],
    clientes: [],
  };

  let crmServiceSpy: jasmine.SpyObj<CrmService>;
  let oportunidadeServiceSpy: jasmine.SpyObj<OportunidadeService>;
  let atividadeServiceSpy: jasmine.SpyObj<AtividadeCrmService>;

  beforeEach(async () => {
    crmServiceSpy = jasmine.createSpyObj('CrmService', ['getDashboard']);
    crmServiceSpy.getDashboard.and.returnValue(of(mockDashboard));

    oportunidadeServiceSpy = jasmine.createSpyObj('OportunidadeService', ['sync', 'delete']);
    oportunidadeServiceSpy.sync.and.callFake(({ body }: any) => of({ ...body.data, internalId: body.data.internalId || 'opp-new' }));
    oportunidadeServiceSpy.delete.and.callFake(({ body }: any) => of(body));

    atividadeServiceSpy = jasmine.createSpyObj('AtividadeCrmService', ['sync', 'delete']);
    atividadeServiceSpy.sync.and.callFake(({ body }: any) => of({ ...body.data, internalId: body.data.internalId || 'act-new' }));
    atividadeServiceSpy.delete.and.callFake(({ body }: any) => of(body));

    await TestBed.configureTestingModule({
      imports: [CrmDashboardComponent],
      providers: [
        provideRouter([]),
        { provide: CrmService, useValue: crmServiceSpy },
        { provide: OportunidadeService, useValue: oportunidadeServiceSpy },
        { provide: AtividadeCrmService, useValue: atividadeServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CrmDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve carregar visão geral do dashboard a partir do backend', () => {
    expect(crmServiceSpy.getDashboard).toHaveBeenCalled();
    expect(component.opportunities.length).toBe(2);
    expect(component.activities.length).toBe(1);
    expect(component.kpis.pipelineAtivo).toBe(145000);
    expect(component.kpis.totalGanho).toBe(120000);
  });

  it('deve persistir movimentação de estágio via OportunidadeService.sync', () => {
    const opp = component.opportunities[0];
    component.moveStage(opp, 'next');
    expect(oportunidadeServiceSpy.sync).toHaveBeenCalledWith({
      body: {
        data: jasmine.objectContaining({
          internalId: 'opp-1',
          estagio: 'ganho',
          probabilidade: 100,
        }),
      },
    });
  });

  it('deve persistir alternância de status da atividade via AtividadeCrmService.sync', () => {
    const act = component.activities[0];
    component.toggleActivity(act);
    expect(atividadeServiceSpy.sync).toHaveBeenCalledWith({
      body: {
        data: jasmine.objectContaining({
          internalId: 'act-1',
          status: 'completed',
        }),
      },
    });
  });

  it('deve segmentar dashboard CRM por tenants selecionados', () => {
    component.onTenantFilterChange(['tenant-crm-1']);
    expect(crmServiceSpy.getDashboard).toHaveBeenCalledWith({
      body: jasmine.objectContaining({
        tenantIds: ['tenant-crm-1'],
      }),
    });
  });
});
