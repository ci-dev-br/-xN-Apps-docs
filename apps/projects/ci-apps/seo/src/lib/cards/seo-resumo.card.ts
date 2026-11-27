import { ChangeDetectorRef, Component, Input, OnInit, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { DashboardSeoDto, SeoService } from '@ci/portal-api';

@Component({
  selector: 'ci-card--seo-resumo',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <mat-card class="seo-resumo-card">
      <mat-card-header>
        <div mat-card-avatar class="seo-avatar">
          <mat-icon>travel_explore</mat-icon>
        </div>
        <mat-card-title>Resumo SEO & Marketing</mat-card-title>
        <mat-card-subtitle>Score técnico, domínios, keywords e backlog</mat-card-subtitle>
        <div class="header-actions">
          <button mat-icon-button (click)="carregar()" [disabled]="loading" title="Atualizar">
            <mat-icon>refresh</mat-icon>
          </button>
        </div>
      </mat-card-header>

      <mat-card-content>
        @if (loading) {
          <div class="loading-box">
            <mat-spinner diameter="28"></mat-spinner>
          </div>
        } @else {
          <div class="metrics-grid">
            <div class="metric-box">
              <span class="metric-val">{{ dashboard?.kpis?.scoreMedio ?? '—' }}</span>
              <span class="metric-lbl">Score Médio</span>
            </div>
            <div class="metric-box">
              <span class="metric-val">{{ dashboard?.kpis?.totalPaginas || 0 }}</span>
              <span class="metric-lbl">Páginas</span>
            </div>
            <div class="metric-box">
              <span class="metric-val">{{ dashboard?.kpis?.palavrasTop10 || 0 }}/{{ dashboard?.kpis?.totalPalavrasChave || 0 }}</span>
              <span class="metric-lbl">Keywords Top 10</span>
            </div>
            <div class="metric-box">
              <span class="metric-val">{{ dashboard?.kpis?.tarefasAbertas || 0 }}</span>
              <span class="metric-lbl">Tarefas Abertas</span>
            </div>
          </div>
        }
      </mat-card-content>

      <mat-card-actions align="end">
        <a mat-button color="primary" routerLink="/SEO">
          Abrir Painel SEO
        </a>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .seo-resumo-card {
      block-size: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .seo-avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(14, 165, 233, 0.14);
      color: #0284c7;
      border-radius: 10px;
    }
    .header-actions {
      margin-inline-start: auto;
    }
    .loading-box {
      display: flex;
      justify-content: center;
      padding: 20px 0;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-block-start: 8px;
    }
    .metric-box {
      display: flex;
      flex-direction: column;
      padding: 10px 12px;
      border-radius: 8px;
      background: var(--mat-sys-surface-container-low, #f8fafc);
    }
    .metric-val {
      font-size: 20px;
      font-weight: 700;
    }
    .metric-lbl {
      font-size: 12px;
      color: var(--mat-sys-on-surface-variant, #64748b);
    }
  `],
})
export class SeoResumoCard implements OnInit {
  @Input() tenantIds?: string[];
  loading = false;
  dashboard?: DashboardSeoDto;

  constructor(
    @Optional() private readonly seoService?: SeoService,
    @Optional() private readonly cdr?: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    if (!this.seoService || typeof this.seoService.getDashboard !== 'function') {
      return;
    }
    this.loading = true;
    this.seoService.getDashboard({
      body: {
        ...(this.tenantIds?.length ? { tenantIds: this.tenantIds } : {}),
      },
    }).subscribe({
      next: (res) => {
        this.loading = false;
        this.dashboard = res;
        this.cdr?.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr?.markForCheck();
      },
    });
  }
}

export const SeoResumoCardInfo = {
  title: 'Resumo SEO & Marketing',
  descricao: 'Métricas rápidas de score on-page, páginas, palavras-chave no Top 10 e tarefas abertas.',
  tags: ['SEO', 'Marketing', 'SERP', 'Auditoria'],
  category: 'Marketing',
  icon: 'travel_explore',
  componentRef: SeoResumoCard,
  componentVersion: '1.0.0',
  componentName: 'SeoResumoCard',
  settings: {},
};
