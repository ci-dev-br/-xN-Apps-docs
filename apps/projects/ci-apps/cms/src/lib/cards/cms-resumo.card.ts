import { ChangeDetectorRef, Component, Input, OnInit, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { CmsService, DashboardCmsDto } from '@ci/portal-api';

@Component({
  selector: 'ci-card--cms-resumo',
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
    <mat-card class="cms-resumo-card">
      <mat-card-header>
        <div mat-card-avatar class="cms-avatar">
          <mat-icon>auto_stories</mat-icon>
        </div>
        <mat-card-title>Resumo Editorial (CMS)</mat-card-title>
        <mat-card-subtitle>Publicações, páginas, mídias e portais</mat-card-subtitle>
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
              <span class="metric-val">{{ dashboard?.kpis?.totalPosts || 0 }}</span>
              <span class="metric-lbl">Posts</span>
            </div>
            <div class="metric-box">
              <span class="metric-val">{{ dashboard?.kpis?.totalPages || 0 }}</span>
              <span class="metric-lbl">Páginas</span>
            </div>
            <div class="metric-box">
              <span class="metric-val">{{ dashboard?.kpis?.totalMedia || 0 }}</span>
              <span class="metric-lbl">Mídias</span>
            </div>
            <div class="metric-box">
              <span class="metric-val">{{ dashboard?.kpis?.totalViews || 0 }}</span>
              <span class="metric-lbl">Visualizações</span>
            </div>
          </div>
        }
      </mat-card-content>

      <mat-card-actions align="end">
        <a mat-button color="primary" routerLink="/CMS">
          Abrir Painel Editorial
        </a>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .cms-resumo-card {
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .cms-avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(124, 58, 237, 0.12);
      color: #7c3aed;
      border-radius: 10px;
    }
    .header-actions {
      margin-left: auto;
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
      margin-top: 8px;
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
export class CmsResumoCard implements OnInit {
  @Input() tenantIds?: string[];
  loading = false;
  dashboard?: DashboardCmsDto;

  constructor(
    @Optional() private readonly cmsService?: CmsService,
    @Optional() private readonly cdr?: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    if (!this.cmsService || typeof this.cmsService.getDashboard !== 'function') {
      return;
    }
    this.loading = true;
    this.cmsService.getDashboard({
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

export const CmsResumoCardInfo = {
  title: 'Resumo Editorial (CMS)',
  descricao: 'Métricas rápidas de posts, páginas, mídias e visualizações do CMS.',
  tags: ['CMS', 'Conteúdo', 'Blog'],
  category: 'Conteúdo',
  icon: 'auto_stories',
  componentRef: CmsResumoCard,
  componentVersion: '1.0.0',
  componentName: 'CmsResumoCard',
  settings: {},
};
