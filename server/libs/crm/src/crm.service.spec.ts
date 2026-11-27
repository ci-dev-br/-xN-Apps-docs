import { Test, TestingModule } from '@nestjs/testing';
import { CrmService } from './crm.service';
import { OportunidadeService } from './service/oportunidade.service';
import { AtividadeCrmService } from './service/atividade-crm.service';
import { ClienteCrmService } from './service/cliente-crm.service';
import { ProfissionalService } from './service/profissional.service';
import { AtendimentoService } from './service/atendimento.service';
import { AgendamentoService } from './service/agendamento.service';
import { CampanhaMarketingService } from './service/campanha-marketing.service';
import { ProdutoService } from './service/produto.service';
import { ServicoService } from './service/servico.service';
import { PromocaoService } from './service/promocao.service';
import { VendaProdutoService } from './service/venda-produto.service';
import { PagamentoService } from './service/pagamento.service';
import { HistoricoContatoService } from './service/historico-contato.service';
import { EstagioOportunidade } from './models/estagio-oportunidade';
import { PrioridadeOportunidade } from './models/prioridade-oportunidade';
import { StatusAtividadeCrm } from './models/status-atividade-crm';
import { TipoAtividadeCrm } from './models/tipo-atividade-crm';

describe('CrmService', () => {
  let service: CrmService;

  const mockOportunidades = [
    {
      internalId: 'opp-1',
      titulo: 'Implantação Portal',
      clienteNome: 'Acme Seguros',
      valor: 100000,
      estagio: EstagioOportunidade.NEGOCIACAO,
      probabilidade: 80,
      responsavel: 'Roberto Silva',
      prioridade: PrioridadeOportunidade.ALTA,
      createdAt: new Date(Date.now() - 5 * 86400000),
    },
    {
      internalId: 'opp-2',
      titulo: 'Licenciamento LMS',
      clienteNome: 'Rede Farma',
      valor: 50000,
      estagio: EstagioOportunidade.GANHO,
      probabilidade: 100,
      responsavel: 'Juliana Costa',
      prioridade: PrioridadeOportunidade.MEDIA,
      createdAt: new Date(Date.now() - 10 * 86400000),
      dataFechamento: new Date(),
    },
  ];

  const mockAtividades = [
    {
      internalId: 'act-1',
      tipo: TipoAtividadeCrm.MEETING,
      titulo: 'Apresentação proposta',
      clienteNome: 'Acme Seguros',
      prazoTexto: 'Hoje às 15:00',
      status: StatusAtividadeCrm.PENDING,
    },
    {
      internalId: 'act-2',
      tipo: TipoAtividadeCrm.TASK,
      titulo: 'Revisão de SLA',
      clienteNome: 'Rede Farma',
      prazoTexto: 'Concluído',
      status: StatusAtividadeCrm.COMPLETED,
    },
  ];

  const emptyListProvider = (cls: any, data: any[] = []) => ({
    provide: cls,
    useValue: {
      obterLista: jest.fn().mockResolvedValue(data),
    },
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CrmService,
        emptyListProvider(OportunidadeService, mockOportunidades),
        emptyListProvider(AtividadeCrmService, mockAtividades),
        emptyListProvider(ClienteCrmService, [{ internalId: 'cli-1', nome: 'Acme Seguros' }]),
        emptyListProvider(ProfissionalService, [{ internalId: 'prof-1', nome: 'Carlos Mendes' }]),
        emptyListProvider(AtendimentoService, []),
        emptyListProvider(AgendamentoService, []),
        emptyListProvider(CampanhaMarketingService, []),
        emptyListProvider(ProdutoService, []),
        emptyListProvider(ServicoService, []),
        emptyListProvider(PromocaoService, []),
        emptyListProvider(VendaProdutoService, []),
        emptyListProvider(PagamentoService, []),
        emptyListProvider(HistoricoContatoService, []),
      ],
    }).compile();

    service = module.get<CrmService>(CrmService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('deve consolidar KPIs, etapas, responsáveis e atividades no dashboard', async () => {
    const dashboard = await service.obterDashboard({});
    expect(dashboard.kpis.pipelineAtivo).toBe(100000);
    expect(dashboard.kpis.totalGanho).toBe(50000);
    expect(dashboard.kpis.oportunidadesEmAberto).toBe(1);
    expect(dashboard.kpis.oportunidadesGanhas).toBe(1);
    expect(dashboard.kpis.taxaConversao).toBe(50);
    expect(dashboard.kpis.atividadesPendentes).toBe(1);
    expect(dashboard.kpis.atividadesConcluidas).toBe(1);
    expect(dashboard.contadores.clientes).toBe(1);
    expect(dashboard.etapas.length).toBe(5);
    expect(dashboard.responsaveis).toEqual(['Carlos Mendes', 'Juliana Costa', 'Roberto Silva']);
  });

  it('deve filtrar oportunidades por responsável quando informado', async () => {
    const dashboard = await service.obterDashboard({ responsavel: 'Roberto Silva' });
    expect(dashboard.oportunidades.length).toBe(1);
    expect(dashboard.kpis.pipelineAtivo).toBe(100000);
    expect(dashboard.kpis.totalGanho).toBe(0);
  });

  it('deve repassar tenantIds para os serviços de domínio na segmentação por tenants', async () => {
    await service.obterDashboard({ tenantIds: ['t-crm-1'] });
    const oppSvc = (service as any).oportunidadeService;
    expect(oppSvc.obterLista).toHaveBeenCalledWith(
      expect.objectContaining({ tenantIds: ['t-crm-1'] }),
      undefined,
    );
  });
});
