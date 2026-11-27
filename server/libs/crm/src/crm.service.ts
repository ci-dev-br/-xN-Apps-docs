import { Injectable } from '@nestjs/common';
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
import {
    DashboardCrmDto,
    DashboardCrmEtapaResumoDto,
    ObterDashboardCrmDto,
} from './dto/dashboard-crm.dto';
import { EstagioOportunidade } from './models/estagio-oportunidade';
import { StatusAtividadeCrm } from './models/status-atividade-crm';
import { Oportunidade } from './models/oportunidade';

const PIPELINE_STAGES: Array<{ id: EstagioOportunidade; titulo: string; cor: string }> = [
    { id: EstagioOportunidade.LEAD, titulo: '1. Prospecção', cor: '#3b82f6' },
    { id: EstagioOportunidade.QUALIFICACAO, titulo: '2. Qualificação', cor: '#8b5cf6' },
    { id: EstagioOportunidade.PROPOSTA, titulo: '3. Proposta', cor: '#eab308' },
    { id: EstagioOportunidade.NEGOCIACAO, titulo: '4. Negociação', cor: '#f97316' },
    { id: EstagioOportunidade.GANHO, titulo: '5. Fechado / Ganho', cor: '#22c55e' },
];

/**
 * CRM Services — Visão Geral Consolidada e Indicadores
 */
@Injectable()
export class CrmService {
    constructor(
        private readonly oportunidadeService: OportunidadeService,
        private readonly atividadeService: AtividadeCrmService,
        private readonly clienteService: ClienteCrmService,
        private readonly profissionalService: ProfissionalService,
        private readonly atendimentoService: AtendimentoService,
        private readonly agendamentoService: AgendamentoService,
        private readonly campanhaService: CampanhaMarketingService,
        private readonly produtoService: ProdutoService,
        private readonly servicoService: ServicoService,
        private readonly promocaoService: PromocaoService,
        private readonly vendaProdutoService: VendaProdutoService,
        private readonly pagamentoService: PagamentoService,
        private readonly historicoContatoService: HistoricoContatoService,
    ) { }

    private extractTenantIds(input?: ObterDashboardCrmDto, req?: any): string[] {
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

    async obterDashboard(input?: ObterDashboardCrmDto, req?: any): Promise<DashboardCrmDto> {
        const tenantIds = this.extractTenantIds(input, req);
        const tenantOption = tenantIds.length > 0 ? { tenantIds } : {};

        const [
            todasOportunidades,
            todasAtividades,
            clientes,
            profissionais,
            atendimentos,
            agendamentos,
            campanhas,
            produtos,
            servicos,
            promocoes,
            vendasProdutos,
            pagamentos,
            historicoContatos,
        ] = await Promise.all([
            this.oportunidadeService.obterLista({ ...tenantOption, orderBy: { createdAt: 'DESC' } }, req),
            this.atividadeService.obterLista({ ...tenantOption, orderBy: { createdAt: 'DESC' } }, req),
            this.clienteService.obterLista({ ...tenantOption, orderBy: { nome: 'ASC' } }, req),
            this.profissionalService.obterLista({ ...tenantOption, orderBy: { nome: 'ASC' } }, req),
            this.atendimentoService.obterLista({ ...tenantOption }, req),
            this.agendamentoService.obterLista({ ...tenantOption }, req),
            this.campanhaService.obterLista({ ...tenantOption }, req),
            this.produtoService.obterLista({ ...tenantOption }, req),
            this.servicoService.obterLista({ ...tenantOption }, req),
            this.promocaoService.obterLista({ ...tenantOption }, req),
            this.vendaProdutoService.obterLista({ ...tenantOption }, req),
            this.pagamentoService.obterLista({ ...tenantOption }, req),
            this.historicoContatoService.obterLista({ ...tenantOption }, req),
        ]);

        const responsaveisSet = new Set<string>();
        profissionais.forEach(p => {
            if (p?.nome?.trim()) responsaveisSet.add(p.nome.trim());
        });
        todasOportunidades.forEach(o => {
            if (o?.responsavel?.trim()) responsaveisSet.add(o.responsavel.trim());
        });

        const filtroResp = input?.responsavel?.trim();
        let oportunidadesFiltradas: Oportunidade[] = todasOportunidades;
        if (filtroResp && filtroResp !== 'Todos') {
            oportunidadesFiltradas = todasOportunidades.filter(
                o => (o.responsavel || '').trim() === filtroResp,
            );
        }
        if (!input?.incluirPerdidas) {
            oportunidadesFiltradas = oportunidadesFiltradas.filter(
                o => o.estagio !== EstagioOportunidade.PERDIDO,
            );
        }

        const abertas = oportunidadesFiltradas.filter(
            o => o.estagio !== EstagioOportunidade.GANHO && o.estagio !== EstagioOportunidade.PERDIDO,
        );
        const ganhas = oportunidadesFiltradas.filter(
            o => o.estagio === EstagioOportunidade.GANHO,
        );
        const perdidas = todasOportunidades.filter(o => {
            const matchOwner = !filtroResp || filtroResp === 'Todos' || (o.responsavel || '').trim() === filtroResp;
            return matchOwner && o.estagio === EstagioOportunidade.PERDIDO;
        });

        const pipelineAtivo = Number(
            abertas.reduce((sum, o) => sum + Number(o.valor || 0), 0).toFixed(2),
        );
        const totalGanho = Number(
            ganhas.reduce((sum, o) => sum + Number(o.valor || 0), 0).toFixed(2),
        );

        const totalConsiderado = oportunidadesFiltradas.length + (input?.incluirPerdidas ? 0 : perdidas.length);
        const taxaConversao = totalConsiderado > 0
            ? Number(((ganhas.length / totalConsiderado) * 100).toFixed(1))
            : 0;

        const ticketMedio = ganhas.length > 0
            ? Number((totalGanho / ganhas.length).toFixed(2))
            : (abertas.length > 0 ? Number((pipelineAtivo / abertas.length).toFixed(2)) : 0);

        const baseCiclo = ganhas.length > 0 ? ganhas : oportunidadesFiltradas;
        const agoraMs = Date.now();
        const cicloMedioDias = baseCiclo.length > 0
            ? Math.round(
                baseCiclo.reduce((acc, o) => {
                    const inicio = o.createdAt ? new Date(o.createdAt).getTime() : agoraMs;
                    const fim = o.dataFechamento ? new Date(o.dataFechamento).getTime() : agoraMs;
                    return acc + Math.max(0, (fim - inicio) / 86400000);
                }, 0) / baseCiclo.length,
            )
            : 0;

        const atividadesFiltradas = (filtroResp && filtroResp !== 'Todos')
            ? todasAtividades.filter(a => !a.responsavel || a.responsavel.trim() === filtroResp)
            : todasAtividades;

        const atividadesPendentes = atividadesFiltradas.filter(
            a => a.status !== StatusAtividadeCrm.COMPLETED,
        ).length;
        const atividadesConcluidas = atividadesFiltradas.filter(
            a => a.status === StatusAtividadeCrm.COMPLETED,
        ).length;

        const etapas: DashboardCrmEtapaResumoDto[] = PIPELINE_STAGES.map(stage => {
            const itens = oportunidadesFiltradas.filter(o => o.estagio === stage.id);
            return {
                id: stage.id,
                titulo: stage.titulo,
                cor: stage.cor,
                quantidade: itens.length,
                valorTotal: Number(
                    itens.reduce((sum, o) => sum + Number(o.valor || 0), 0).toFixed(2),
                ),
            };
        });

        return {
            kpis: {
                pipelineAtivo,
                totalGanho,
                oportunidadesEmAberto: abertas.length,
                totalOportunidades: oportunidadesFiltradas.length,
                oportunidadesGanhas: ganhas.length,
                oportunidadesPerdidas: perdidas.length,
                taxaConversao,
                ticketMedio,
                cicloMedioDias,
                atividadesPendentes,
                atividadesConcluidas,
            },
            contadores: {
                clientes: clientes.length,
                atendimentos: atendimentos.length,
                agendamentos: agendamentos.length,
                historicoContatos: historicoContatos.length,
                produtos: produtos.length,
                servicos: servicos.length,
                promocoes: promocoes.length,
                campanhas: campanhas.length,
                profissionais: profissionais.length,
                vendasProdutos: vendasProdutos.length,
                pagamentos: pagamentos.length,
            },
            etapas,
            oportunidades: oportunidadesFiltradas,
            atividades: atividadesFiltradas,
            responsaveis: Array.from(responsaveisSet).sort((a, b) => a.localeCompare(b)),
            clientes,
        };
    }
}
