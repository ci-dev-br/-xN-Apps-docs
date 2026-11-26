import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';

export interface CrmOpportunity {
  id: string;
  title: string;
  client: string;
  value: number;
  stageId: 'lead' | 'qualificacao' | 'proposta' | 'negociacao' | 'ganho';
  probability: number;
  owner: string;
  ownerAvatar?: string;
  daysInStage: number;
  priority: 'alta' | 'media' | 'baixa';
  expectedClose: string;
}

export interface PipelineStage {
  id: 'lead' | 'qualificacao' | 'proposta' | 'negociacao' | 'ganho';
  title: string;
  color: string;
}

export interface CrmActivity {
  id: string;
  type: 'call' | 'meeting' | 'email' | 'task';
  title: string;
  client: string;
  dueTime: string;
  status: 'pending' | 'completed';
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
    MatTooltipModule,
    MatMenuModule
  ],
  templateUrl: './crm-dashboard.component.html',
  styleUrls: ['./crm-dashboard.component.scss']
})
export class CrmDashboardComponent implements OnInit {
  stages: PipelineStage[] = [
    { id: 'lead', title: '1. Prospecção', color: '#3b82f6' },
    { id: 'qualificacao', title: '2. Qualificação', color: '#8b5cf6' },
    { id: 'proposta', title: '3. Proposta', color: '#eab308' },
    { id: 'negociacao', title: '4. Negociação', color: '#f97316' },
    { id: 'ganho', title: '5. Fechado / Ganho', color: '#22c55e' }
  ];

  opportunities: CrmOpportunity[] = [
    {
      id: 'opp-1',
      title: 'Implantação Portal Corporativo',
      client: 'Acme Seguros S.A.',
      value: 145000,
      stageId: 'negociacao',
      probability: 80,
      owner: 'Roberto Silva',
      daysInStage: 4,
      priority: 'alta',
      expectedClose: '28/10/2026'
    },
    {
      id: 'opp-2',
      title: 'Licenciamento Anual Cloud & CMS',
      client: 'TechVanguard Brasil',
      value: 86000,
      stageId: 'proposta',
      probability: 60,
      owner: 'Juliana Costa',
      daysInStage: 2,
      priority: 'alta',
      expectedClose: '05/11/2026'
    },
    {
      id: 'opp-3',
      title: 'Consultoria de Migração de Infra',
      client: 'Hospital Vida Nova',
      value: 62000,
      stageId: 'qualificacao',
      probability: 40,
      owner: 'Lucas Prado',
      daysInStage: 6,
      priority: 'media',
      expectedClose: '15/11/2026'
    },
    {
      id: 'opp-4',
      title: 'Módulo Treinamento Corporativo LMS',
      client: 'Rede Farma Mais',
      value: 120000,
      stageId: 'ganho',
      probability: 100,
      owner: 'Roberto Silva',
      daysInStage: 1,
      priority: 'alta',
      expectedClose: '18/10/2026'
    },
    {
      id: 'opp-5',
      title: 'Desenvolvimento App Sob Demanda',
      client: 'Logix Distribuidora',
      value: 48000,
      stageId: 'lead',
      probability: 20,
      owner: 'Mariana Duarte',
      daysInStage: 3,
      priority: 'baixa',
      expectedClose: '30/11/2026'
    },
    {
      id: 'opp-6',
      title: 'Expansão de Licenças Analytics',
      client: 'Fintech Aurora',
      value: 34000,
      stageId: 'proposta',
      probability: 70,
      owner: 'Juliana Costa',
      daysInStage: 5,
      priority: 'media',
      expectedClose: '08/11/2026'
    }
  ];

  activities: CrmActivity[] = [
    { id: 'act-1', type: 'meeting', title: 'Apresentação comercial da proposta final', client: 'Acme Seguros S.A.', dueTime: 'Hoje às 15:00', status: 'pending' },
    { id: 'act-2', type: 'call', title: 'Alinhamento com decisor técnico', client: 'TechVanguard Brasil', dueTime: 'Hoje às 17:30', status: 'pending' },
    { id: 'act-3', type: 'email', title: 'Envio de aditivo contratual e NDA', client: 'Hospital Vida Nova', dueTime: 'Amanhã às 10:00', status: 'pending' },
    { id: 'act-4', type: 'task', title: 'Revisão de SLA e onboarding de usuários', client: 'Rede Farma Mais', dueTime: 'Concluído', status: 'completed' }
  ];

  // Filtro e modal de nova oportunidade
  selectedOwner = 'Todos';
  showNewOppModal = false;
  newOpp: Partial<CrmOpportunity> = {
    title: '',
    client: '',
    value: 10000,
    stageId: 'lead',
    priority: 'media',
    probability: 25,
    owner: 'Roberto Silva'
  };

  ngOnInit(): void {}

  get filteredOpportunities(): CrmOpportunity[] {
    if (this.selectedOwner === 'Todos') {
      return this.opportunities;
    }
    return this.opportunities.filter(o => o.owner === this.selectedOwner);
  }

  getStageOpportunities(stageId: string): CrmOpportunity[] {
    return this.filteredOpportunities.filter(o => o.stageId === stageId);
  }

  getStageTotal(stageId: string): number {
    return this.getStageOpportunities(stageId).reduce((sum, o) => sum + o.value, 0);
  }

  getTotalPipelineValue(): number {
    return this.filteredOpportunities
      .filter(o => o.stageId !== 'ganho')
      .reduce((sum, o) => sum + o.value, 0);
  }

  getTotalWonValue(): number {
    return this.filteredOpportunities
      .filter(o => o.stageId === 'ganho')
      .reduce((sum, o) => sum + o.value, 0);
  }

  moveStage(opp: CrmOpportunity, direction: 'next' | 'prev'): void {
    const stageIds: ('lead' | 'qualificacao' | 'proposta' | 'negociacao' | 'ganho')[] = [
      'lead', 'qualificacao', 'proposta', 'negociacao', 'ganho'
    ];
    const currentIndex = stageIds.indexOf(opp.stageId);
    if (direction === 'next' && currentIndex < stageIds.length - 1) {
      opp.stageId = stageIds[currentIndex + 1];
      opp.daysInStage = 0;
      opp.probability = Math.min(100, opp.probability + 20);
    } else if (direction === 'prev' && currentIndex > 0) {
      opp.stageId = stageIds[currentIndex - 1];
      opp.daysInStage = 0;
      opp.probability = Math.max(10, opp.probability - 20);
    }
  }

  openNewOppModal(): void {
    this.newOpp = {
      title: '',
      client: '',
      value: 25000,
      stageId: 'lead',
      priority: 'media',
      probability: 30,
      owner: 'Roberto Silva',
      expectedClose: new Date().toLocaleDateString('pt-BR')
    };
    this.showNewOppModal = true;
  }

  saveNewOpportunity(): void {
    if (!this.newOpp.title || !this.newOpp.client) return;

    const opp: CrmOpportunity = {
      id: `opp-${Date.now()}`,
      title: this.newOpp.title,
      client: this.newOpp.client,
      value: Number(this.newOpp.value) || 0,
      stageId: (this.newOpp.stageId as any) || 'lead',
      probability: Number(this.newOpp.probability) || 30,
      owner: this.newOpp.owner || 'Minha Equipe',
      daysInStage: 0,
      priority: (this.newOpp.priority as any) || 'media',
      expectedClose: this.newOpp.expectedClose || new Date().toLocaleDateString('pt-BR')
    };

    this.opportunities.unshift(opp);
    this.showNewOppModal = false;
  }

  toggleActivity(act: CrmActivity): void {
    act.status = act.status === 'completed' ? 'pending' : 'completed';
  }
}
