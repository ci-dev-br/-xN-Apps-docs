import { ChangeDetectorRef, Component, OnDestroy, OnInit, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TenantFilterBarComponent } from '@ci/components';
import { Subscription } from 'rxjs';
import {
  AtividadeCrm,
  AtividadeCrmService,
  ClienteCrm,
  CrmService,
  DashboardCrmContadoresDto,
  DashboardCrmDto,
  DashboardCrmKpisDto,
  Oportunidade,
  OportunidadeService,
} from '@ci/portal-api';

export type CrmStageId = 'lead' | 'qualificacao' | 'proposta' | 'negociacao' | 'ganho';

export interface PipelineStage {
  id: CrmStageId;
  title: string;
  color: string;
}

@Component({
  selector: 'ci-crm-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatMenuModule,
    MatSnackBarModule,
    TenantFilterBarComponent,
  ],
  templateUrl: './crm-dashboard.component.html',
  styleUrls: ['./crm-dashboard.component.scss']
})
export class CrmDashboardComponent implements OnInit, OnDestroy {
  selectedTenantIds: string[] = [];
  stages: PipelineStage[] = [
    { id: 'lead', title: '1. Prospecção', color: '#3b82f6' },
    { id: 'qualificacao', title: '2. Qualificação', color: '#8b5cf6' },
    { id: 'proposta', title: '3. Proposta', color: '#eab308' },
    { id: 'negociacao', title: '4. Negociação', color: '#f97316' },
    { id: 'ganho', title: '5. Fechado / Ganho', color: '#22c55e' }
  ];

  opportunities: Oportunidade[] = [];
  activities: AtividadeCrm[] = [];
  responsaveis: string[] = [];
  clientes: ClienteCrm[] = [];

  kpis: DashboardCrmKpisDto = {
    pipelineAtivo: 0,
    totalGanho: 0,
    oportunidadesEmAberto: 0,
    totalOportunidades: 0,
    oportunidadesGanhas: 0,
    oportunidadesPerdidas: 0,
    taxaConversao: 0,
    ticketMedio: 0,
    cicloMedioDias: 0,
    atividadesPendentes: 0,
    atividadesConcluidas: 0,
  };

  contadores: DashboardCrmContadoresDto = {
    clientes: 0,
    atendimentos: 0,
    agendamentos: 0,
    historicoContatos: 0,
    produtos: 0,
    servicos: 0,
    promocoes: 0,
    campanhas: 0,
    profissionais: 0,
    vendasProdutos: 0,
    pagamentos: 0,
  };

  loading = false;
  savingOpp = false;
  savingActivity = false;

  // Filtro e modal de nova oportunidade
  selectedOwner = 'Todos';
  showNewOppModal = false;
  newOpp: Partial<Oportunidade> = {
    titulo: '',
    clienteNome: '',
    clienteId: undefined,
    valor: 25000,
    estagio: 'lead',
    prioridade: 'media',
    probabilidade: 30,
    responsavel: '',
    previsaoFechamento: '',
    observacoes: '',
  };

  // Modal de nova atividade / follow-up
  showNewActivityModal = false;
  newActivity: Partial<AtividadeCrm> = {
    tipo: 'task',
    titulo: '',
    clienteNome: '',
    clienteId: undefined,
    prazoTexto: '',
    responsavel: '',
    observacoes: '',
  };

  private dashboardSub?: Subscription;

  constructor(
    @Optional() private readonly crmService?: CrmService,
    @Optional() private readonly oportunidadeService?: OportunidadeService,
    @Optional() private readonly atividadeService?: AtividadeCrmService,
    @Optional() private readonly snackBar?: MatSnackBar,
    @Optional() private readonly cdr?: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.loadDashboard();
  }

  ngOnDestroy(): void {
    this.dashboardSub?.unsubscribe();
  }

  loadDashboard(): void {
    if (!this.crmService || typeof this.crmService.getDashboard !== 'function') {
      return;
    }

    this.loading = true;
    this.dashboardSub?.unsubscribe();
    this.dashboardSub = this.crmService.getDashboard({
      body: {
        responsavel: this.selectedOwner !== 'Todos' ? this.selectedOwner : undefined,
        incluirPerdidas: false,
        tenantIds: this.selectedTenantIds.length > 0 ? [...this.selectedTenantIds] : undefined,
      }
    }).subscribe({
      next: (res: DashboardCrmDto) => {
        this.loading = false;
        this.opportunities = Array.isArray(res?.oportunidades) ? res.oportunidades : [];
        this.activities = Array.isArray(res?.atividades) ? res.atividades : [];
        this.responsaveis = Array.isArray(res?.responsaveis) ? res.responsaveis : [];
        this.clientes = Array.isArray(res?.clientes) ? res.clientes : [];
        if (res?.kpis) {
          this.kpis = res.kpis;
        } else {
          this.recomputeLocalKpis();
        }
        if (res?.contadores) {
          this.contadores = res.contadores;
        }
        this.cdr?.markForCheck();
        this.cdr?.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.snackBar?.open('Não foi possível carregar os dados do dashboard de CRM.', 'Fechar', { duration: 4000 });
        this.cdr?.markForCheck();
        this.cdr?.detectChanges();
      }
    });
  }

  onOwnerFilterChange(): void {
    this.loadDashboard();
  }

  onTenantFilterChange(tenantIds: string[]): void {
    this.selectedTenantIds = Array.isArray(tenantIds) ? tenantIds : [];
    this.loadDashboard();
  }

  get filteredOpportunities(): Oportunidade[] {
    if (this.selectedOwner === 'Todos') {
      return this.opportunities;
    }
    return this.opportunities.filter(o => (o.responsavel || '').trim() === this.selectedOwner);
  }

  getStageOpportunities(stageId: CrmStageId): Oportunidade[] {
    return this.filteredOpportunities.filter(o => (o.estagio || 'lead') === stageId);
  }

  getStageTotal(stageId: CrmStageId): number {
    return this.getStageOpportunities(stageId).reduce((sum, o) => sum + Number(o.valor || 0), 0);
  }

  getTotalPipelineValue(): number {
    return this.filteredOpportunities
      .filter(o => o.estagio !== 'ganho' && o.estagio !== 'perdido')
      .reduce((sum, o) => sum + Number(o.valor || 0), 0);
  }

  getTotalWonValue(): number {
    return this.filteredOpportunities
      .filter(o => o.estagio === 'ganho')
      .reduce((sum, o) => sum + Number(o.valor || 0), 0);
  }

  getOpenOpportunitiesCount(): number {
    return this.filteredOpportunities.filter(
      o => o.estagio !== 'ganho' && o.estagio !== 'perdido'
    ).length;
  }

  getDaysInStage(opp: Oportunidade): number {
    const refDate = opp.dataMudancaEtapa || opp.createdAt;
    if (!refDate) return 0;
    const ms = Date.now() - new Date(refDate as any).getTime();
    return Math.max(0, Math.floor(ms / 86400000));
  }

  formatExpectedClose(opp: Oportunidade): string {
    if (!opp.previsaoFechamento) return 'Sem previsão';
    const d = new Date(opp.previsaoFechamento);
    if (isNaN(d.getTime())) return String(opp.previsaoFechamento);
    return d.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  }

  getActivityIcon(tipo?: string): string {
    switch (tipo) {
      case 'call': return 'call';
      case 'meeting': return 'groups';
      case 'email': return 'mail';
      default: return 'task_alt';
    }
  }

  moveStage(opp: Oportunidade, direction: 'next' | 'prev'): void {
    const stageIds: CrmStageId[] = ['lead', 'qualificacao', 'proposta', 'negociacao', 'ganho'];
    const currentStage = (opp.estagio as CrmStageId) || 'lead';
    const currentIndex = stageIds.indexOf(currentStage);
    if (currentIndex < 0) return;

    let nextStage = currentStage;
    let nextProb = Number(opp.probabilidade ?? 20);
    if (direction === 'next' && currentIndex < stageIds.length - 1) {
      nextStage = stageIds[currentIndex + 1];
      nextProb = nextStage === 'ganho' ? 100 : Math.min(100, nextProb + 20);
    } else if (direction === 'prev' && currentIndex > 0) {
      nextStage = stageIds[currentIndex - 1];
      nextProb = Math.max(10, nextProb - 20);
    } else {
      return;
    }

    const previousStage = opp.estagio;
    const previousProb = opp.probabilidade;
    opp.estagio = nextStage;
    opp.probabilidade = nextProb;
    opp.dataMudancaEtapa = new Date().toISOString();
    this.recomputeLocalKpis();

    if (!this.oportunidadeService || !opp.internalId) return;

    this.oportunidadeService.sync({
      body: {
        data: {
          internalId: opp.internalId,
          titulo: opp.titulo,
          estagio: nextStage,
          probabilidade: nextProb,
        }
      }
    }).subscribe({
      next: (saved) => {
        Object.assign(opp, saved);
        this.loadDashboard();
      },
      error: () => {
        opp.estagio = previousStage;
        opp.probabilidade = previousProb;
        this.recomputeLocalKpis();
        this.snackBar?.open('Erro ao atualizar etapa da oportunidade.', 'Fechar', { duration: 3500 });
        this.cdr?.markForCheck();
      }
    });
  }

  deleteOpportunity(opp: Oportunidade): void {
    if (!opp.internalId || !this.oportunidadeService) return;
    this.oportunidadeService.delete({ body: opp }).subscribe({
      next: () => {
        this.opportunities = this.opportunities.filter(o => o.internalId !== opp.internalId);
        this.recomputeLocalKpis();
        this.snackBar?.open('Oportunidade removida.', 'OK', { duration: 2500 });
        this.loadDashboard();
      },
      error: () => {
        this.snackBar?.open('Falha ao remover oportunidade.', 'Fechar', { duration: 3500 });
      }
    });
  }

  openNewOppModal(): void {
    const defaultDate = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
    this.newOpp = {
      titulo: '',
      clienteNome: '',
      clienteId: undefined,
      valor: 25000,
      estagio: 'lead',
      prioridade: 'media',
      probabilidade: 30,
      responsavel: this.selectedOwner !== 'Todos' ? this.selectedOwner : (this.responsaveis[0] || ''),
      previsaoFechamento: defaultDate,
      observacoes: '',
    };
    this.showNewOppModal = true;
  }

  onSelectOppCliente(clienteId: string): void {
    this.newOpp.clienteId = clienteId || undefined;
    const found = this.clientes.find(c => c.internalId === clienteId);
    if (found?.nome) {
      this.newOpp.clienteNome = found.nome;
    }
  }

  saveNewOpportunity(): void {
    if (!this.newOpp.titulo?.trim() || (!this.newOpp.clienteNome?.trim() && !this.newOpp.clienteId)) return;

    const payload: Oportunidade = {
      titulo: this.newOpp.titulo.trim(),
      clienteNome: this.newOpp.clienteNome?.trim() || undefined,
      clienteId: this.newOpp.clienteId || undefined,
      valor: Number(this.newOpp.valor) || 0,
      estagio: (this.newOpp.estagio as CrmStageId) || 'lead',
      probabilidade: Number(this.newOpp.probabilidade) || 30,
      responsavel: this.newOpp.responsavel?.trim() || undefined,
      prioridade: (this.newOpp.prioridade as any) || 'media',
      previsaoFechamento: this.newOpp.previsaoFechamento || undefined,
      observacoes: this.newOpp.observacoes?.trim() || undefined,
      ...(this.selectedTenantIds.length > 0 ? { tenants: this.selectedTenantIds.map(id => ({ id })) as any } : {}),
    };

    if (!this.oportunidadeService) {
      this.opportunities.unshift(payload);
      this.showNewOppModal = false;
      this.recomputeLocalKpis();
      return;
    }

    this.savingOpp = true;
    this.oportunidadeService.sync({ body: { data: payload } }).subscribe({
      next: (created) => {
        this.savingOpp = false;
        this.showNewOppModal = false;
        if (created) {
          this.opportunities.unshift(created);
        }
        this.snackBar?.open('Oportunidade registrada no funil!', 'OK', { duration: 3000 });
        this.loadDashboard();
      },
      error: () => {
        this.savingOpp = false;
        this.snackBar?.open('Erro ao salvar oportunidade no backend.', 'Fechar', { duration: 4000 });
        this.cdr?.markForCheck();
      }
    });
  }

  openNewActivityModal(): void {
    this.newActivity = {
      tipo: 'task',
      titulo: '',
      clienteNome: '',
      clienteId: undefined,
      prazoTexto: 'Hoje às 16:00',
      responsavel: this.selectedOwner !== 'Todos' ? this.selectedOwner : '',
      observacoes: '',
    };
    this.showNewActivityModal = true;
  }

  onSelectActivityCliente(clienteId: string): void {
    this.newActivity.clienteId = clienteId || undefined;
    const found = this.clientes.find(c => c.internalId === clienteId);
    if (found?.nome) {
      this.newActivity.clienteNome = found.nome;
    }
  }

  saveNewActivity(): void {
    if (!this.newActivity.titulo?.trim()) return;

    const payload: AtividadeCrm = {
      tipo: (this.newActivity.tipo as any) || 'task',
      titulo: this.newActivity.titulo.trim(),
      clienteNome: this.newActivity.clienteNome?.trim() || undefined,
      clienteId: this.newActivity.clienteId || undefined,
      prazoTexto: this.newActivity.prazoTexto?.trim() || undefined,
      responsavel: this.newActivity.responsavel?.trim() || undefined,
      status: 'pending',
      observacoes: this.newActivity.observacoes?.trim() || undefined,
      ...(this.selectedTenantIds.length > 0 ? { tenants: this.selectedTenantIds.map(id => ({ id })) as any } : {}),
    };

    if (!this.atividadeService) {
      this.activities.unshift(payload);
      this.showNewActivityModal = false;
      return;
    }

    this.savingActivity = true;
    this.atividadeService.sync({ body: { data: payload } }).subscribe({
      next: (created) => {
        this.savingActivity = false;
        this.showNewActivityModal = false;
        if (created) {
          this.activities.unshift(created);
        }
        this.snackBar?.open('Atividade adicionada!', 'OK', { duration: 2500 });
        this.loadDashboard();
      },
      error: () => {
        this.savingActivity = false;
        this.snackBar?.open('Erro ao salvar atividade no backend.', 'Fechar', { duration: 4000 });
        this.cdr?.markForCheck();
      }
    });
  }

  toggleActivity(act: AtividadeCrm): void {
    const previousStatus = act.status;
    const nextStatus = act.status === 'completed' ? 'pending' : 'completed';
    act.status = nextStatus;
    this.recomputeLocalKpis();

    if (!this.atividadeService || !act.internalId) return;

    this.atividadeService.sync({
      body: {
        data: {
          internalId: act.internalId,
          titulo: act.titulo,
          status: nextStatus,
        }
      }
    }).subscribe({
      next: (saved) => {
        Object.assign(act, saved);
        this.loadDashboard();
      },
      error: () => {
        act.status = previousStatus;
        this.recomputeLocalKpis();
        this.snackBar?.open('Erro ao atualizar status da atividade.', 'Fechar', { duration: 3500 });
        this.cdr?.markForCheck();
      }
    });
  }

  deleteActivity(act: AtividadeCrm): void {
    if (!act.internalId || !this.atividadeService) return;
    this.atividadeService.delete({ body: act }).subscribe({
      next: () => {
        this.activities = this.activities.filter(a => a.internalId !== act.internalId);
        this.recomputeLocalKpis();
        this.snackBar?.open('Atividade removida.', 'OK', { duration: 2500 });
        this.loadDashboard();
      },
      error: () => {
        this.snackBar?.open('Erro ao remover atividade.', 'Fechar', { duration: 3500 });
      }
    });
  }

  private recomputeLocalKpis(): void {
    const filtered = this.filteredOpportunities;
    const abertas = filtered.filter(o => o.estagio !== 'ganho' && o.estagio !== 'perdido');
    const ganhas = filtered.filter(o => o.estagio === 'ganho');
    const perdidas = filtered.filter(o => o.estagio === 'perdido');
    const pipelineAtivo = abertas.reduce((sum, o) => sum + Number(o.valor || 0), 0);
    const totalGanho = ganhas.reduce((sum, o) => sum + Number(o.valor || 0), 0);
    const totalOps = filtered.length;

    this.kpis = {
      ...this.kpis,
      pipelineAtivo,
      totalGanho,
      oportunidadesEmAberto: abertas.length,
      totalOportunidades: totalOps,
      oportunidadesGanhas: ganhas.length,
      oportunidadesPerdidas: perdidas.length,
      taxaConversao: totalOps > 0 ? Number(((ganhas.length / totalOps) * 100).toFixed(1)) : 0,
      ticketMedio: ganhas.length > 0
        ? Number((totalGanho / ganhas.length).toFixed(2))
        : (abertas.length > 0 ? Number((pipelineAtivo / abertas.length).toFixed(2)) : 0),
      atividadesPendentes: this.activities.filter(a => a.status !== 'completed').length,
      atividadesConcluidas: this.activities.filter(a => a.status === 'completed').length,
    };
  }
}
