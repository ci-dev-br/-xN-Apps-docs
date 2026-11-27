import { ChangeDetectorRef, Component, OnDestroy, OnInit, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TenantFilterBarComponent } from '@ci/components';
import { Observable, Subscription } from 'rxjs';
import {
  CmsService,
  DashboardCmsContentItemDto,
  DashboardCmsDto,
  DashboardCmsKpisDto,
  SiteMedia,
  SiteMediaService,
  SitePageService,
  SitePostService,
  Website,
} from '@ci/portal-api';

export type CmsContentTypeFilter = 'todos' | 'post' | 'page' | 'notice';
export type CmsContentStatus = 'publicado' | 'rascunho' | 'revisao' | 'agendado';

export interface CmsContentFormModel {
  internalId?: string;
  sourceEntity?: 'SitePost' | 'SitePage';
  title: string;
  slug: string;
  urlMatch: string;
  type: 'post' | 'page' | 'notice';
  category: string;
  author: string;
  status: CmsContentStatus;
  excerpt: string;
  contentHtml: string;
  websiteId: string;
}

export interface CmsMediaFormModel {
  filename: string;
  url: string;
  mediaType: 'image' | 'pdf' | 'video' | 'audio' | 'document';
  sizeLabel: string;
  altText: string;
  websiteId: string;
}

@Component({
  selector: 'ci-cms-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatTabsModule,
    MatProgressBarModule,
    MatSnackBarModule,
    TenantFilterBarComponent,
  ],
  templateUrl: './cms-dashboard.component.html',
  styleUrls: ['./cms-dashboard.component.scss'],
})
export class CmsDashboardComponent implements OnInit, OnDestroy {
  selectedFilter: CmsContentTypeFilter = 'todos';
  selectedWebsiteId = 'todos';
  selectedTenantIds: string[] = [];
  searchQuery = '';

  contents: DashboardCmsContentItemDto[] = [];
  recentMedia: SiteMedia[] = [];
  websites: Website[] = [];

  kpis: DashboardCmsKpisDto = {
    totalPosts: 0,
    totalPages: 0,
    totalNotices: 0,
    totalPublished: 0,
    totalDrafts: 0,
    totalViews: 0,
    totalMedia: 0,
    totalComments: 0,
    totalWebsites: 0,
    totalLinks: 0,
    totalTerms: 0,
  };

  loading = false;
  savingContent = false;
  savingMedia = false;

  // Modal Novo / Editar Conteúdo
  showContentModal = false;
  isEditingContent = false;
  contentForm: CmsContentFormModel = this.createEmptyContentForm();

  // Modal Nova Mídia
  showMediaModal = false;
  mediaForm: CmsMediaFormModel = this.createEmptyMediaForm();

  private dashboardSub?: Subscription;

  constructor(
    @Optional() private readonly cmsService?: CmsService,
    @Optional() private readonly sitePostService?: SitePostService,
    @Optional() private readonly sitePageService?: SitePageService,
    @Optional() private readonly siteMediaService?: SiteMediaService,
    @Optional() private readonly snackBar?: MatSnackBar,
    @Optional() private readonly cdr?: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  ngOnDestroy(): void {
    this.dashboardSub?.unsubscribe();
  }

  private createEmptyContentForm(): CmsContentFormModel {
    return {
      internalId: undefined,
      sourceEntity: undefined,
      title: '',
      slug: '',
      urlMatch: '',
      type: 'post',
      category: 'Geral',
      author: 'Editor Portal',
      status: 'publicado',
      excerpt: '',
      contentHtml: '',
      websiteId: '',
    };
  }

  private createEmptyMediaForm(): CmsMediaFormModel {
    return {
      filename: '',
      url: '',
      mediaType: 'image',
      sizeLabel: '',
      altText: '',
      websiteId: '',
    };
  }

  loadDashboard(): void {
    if (!this.cmsService || typeof this.cmsService.getDashboard !== 'function') {
      return;
    }

    this.loading = true;
    this.dashboardSub?.unsubscribe();
    this.dashboardSub = this.cmsService
      .getDashboard({
        body: {
          websiteId: this.selectedWebsiteId !== 'todos' ? this.selectedWebsiteId : undefined,
          tenantIds: this.selectedTenantIds.length > 0 ? [...this.selectedTenantIds] : undefined,
        },
      })
      .subscribe({
        next: (res: DashboardCmsDto) => {
          this.loading = false;
          this.contents = Array.isArray(res?.contents) ? res.contents : [];
          this.recentMedia = Array.isArray(res?.recentMedia) ? res.recentMedia : [];
          this.websites = Array.isArray(res?.websites) ? res.websites : [];
          if (res?.kpis) {
            this.kpis = res.kpis;
          }
          this.cdr?.markForCheck();
          this.cdr?.detectChanges();
        },
        error: () => {
          this.loading = false;
          this.snackBar?.open('Não foi possível carregar a visão geral do CMS.', 'Fechar', { duration: 4000 });
          this.cdr?.markForCheck();
          this.cdr?.detectChanges();
        },
      });
  }

  onWebsiteFilterChange(): void {
    this.loadDashboard();
  }

  onTenantFilterChange(tenantIds: string[]): void {
    this.selectedTenantIds = Array.isArray(tenantIds) ? tenantIds : [];
    this.loadDashboard();
  }

  get filteredContents(): DashboardCmsContentItemDto[] {
    const query = (this.searchQuery || '').trim().toLowerCase();
    return this.contents.filter((item) => {
      const matchType = this.selectedFilter === 'todos' || item.type === this.selectedFilter;
      const matchQuery =
        !query ||
        (item.title || '').toLowerCase().includes(query) ||
        (item.category || '').toLowerCase().includes(query) ||
        (item.slug || '').toLowerCase().includes(query) ||
        (item.author || '').toLowerCase().includes(query);
      return matchType && matchQuery;
    });
  }

  get totalPosts(): number {
    return this.kpis.totalPosts || this.contents.filter((c) => c.type === 'post').length;
  }

  get totalPages(): number {
    return this.kpis.totalPages || this.contents.filter((c) => c.type === 'page').length;
  }

  get totalNotices(): number {
    return this.kpis.totalNotices || this.contents.filter((c) => c.type === 'notice').length;
  }

  get totalViews(): number {
    return this.kpis.totalViews || this.contents.reduce((sum, c) => sum + Number(c.views || 0), 0);
  }

  get totalMediaCount(): number {
    return this.kpis.totalMedia || this.recentMedia.length;
  }

  openNewModal(): void {
    this.isEditingContent = false;
    this.contentForm = this.createEmptyContentForm();
    if (this.selectedWebsiteId !== 'todos') {
      this.contentForm.websiteId = this.selectedWebsiteId;
    }
    this.showContentModal = true;
  }

  openEditModal(item: DashboardCmsContentItemDto): void {
    this.isEditingContent = true;
    this.contentForm = {
      internalId: item.internalId,
      sourceEntity: item.sourceEntity,
      title: item.title || '',
      slug: item.slug || '',
      urlMatch: item.urlMatch || (item.slug ? `/${item.slug}` : ''),
      type: item.type || 'post',
      category: item.category || 'Geral',
      author: item.author || 'Editor Portal',
      status: item.status || 'rascunho',
      excerpt: item.excerpt || '',
      contentHtml: item.contentHtml || '',
      websiteId: item.websiteId || '',
    };
    this.showContentModal = true;
  }

  generateSlug(): void {
    if (this.contentForm.title && !this.isEditingContent) {
      const slug = this.slugify(this.contentForm.title);
      this.contentForm.slug = slug;
      if (this.contentForm.type === 'page') {
        this.contentForm.urlMatch = slug ? `/${slug}` : '';
      }
    }
  }

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  saveContent(): void {
    const title = (this.contentForm.title || '').trim();
    if (!title || this.savingContent) return;

    const slug = (this.contentForm.slug || '').trim() || this.slugify(title) || 'conteudo';
    const websiteRef = this.contentForm.websiteId
      ? ({ internalId: this.contentForm.websiteId } as Website)
      : undefined;
    const contentArr = this.contentForm.contentHtml?.trim()
      ? [this.contentForm.contentHtml.trim()]
      : undefined;
    const isPublished = this.contentForm.status === 'publicado';

    const targetEntity: 'SitePost' | 'SitePage' =
      this.isEditingContent && this.contentForm.sourceEntity
        ? this.contentForm.sourceEntity
        : this.contentForm.type === 'page'
          ? 'SitePage'
          : 'SitePost';

    this.savingContent = true;

    if (targetEntity === 'SitePage') {
      if (!this.sitePageService) {
        this.savingContent = false;
        return;
      }
      const rawUrlMatch = (this.contentForm.urlMatch || `/${slug}`).trim();
      const normalizedUrlMatch = rawUrlMatch.startsWith('/') ? rawUrlMatch : `/${rawUrlMatch}`;
      this.sitePageService
        .sync({
          body: {
            data: {
              internalId: this.contentForm.internalId || undefined,
              title,
              slug,
              urlMatch: normalizedUrlMatch,
              category: (this.contentForm.category || 'Institucional').trim(),
              author: (this.contentForm.author || 'Editor Portal').trim(),
              status: this.contentForm.status,
              excerpt: (this.contentForm.excerpt || '').trim(),
              contentType: 'text/html',
              content: contentArr,
              publishedAt: isPublished ? new Date().toISOString() : undefined,
              website: websiteRef,
              ...(this.selectedTenantIds.length > 0 && !this.contentForm.internalId
                ? { tenants: this.selectedTenantIds.map(id => ({ id })) as any }
                : {}),
            },
          },
        })
        .subscribe({
          next: () => {
            this.savingContent = false;
            this.showContentModal = false;
            this.snackBar?.open(
              this.isEditingContent ? 'Página atualizada com sucesso.' : 'Página criada com sucesso.',
              'Fechar',
              { duration: 3000 },
            );
            this.loadDashboard();
          },
          error: () => {
            this.savingContent = false;
            this.snackBar?.open('Erro ao salvar página no backend.', 'Fechar', { duration: 4000 });
            this.cdr?.markForCheck();
          },
        });
      return;
    }

    if (!this.sitePostService) {
      this.savingContent = false;
      return;
    }

    this.sitePostService
      .sync({
        body: {
          data: {
            internalId: this.contentForm.internalId || undefined,
            title,
            slug,
            type: this.contentForm.type,
            category: (this.contentForm.category || 'Geral').trim(),
            author: (this.contentForm.author || 'Editor Portal').trim(),
            status: this.contentForm.status,
            excerpt: (this.contentForm.excerpt || '').trim(),
            content: contentArr,
            publishedAt: isPublished ? new Date().toISOString() : undefined,
            website: websiteRef,
            ...(this.selectedTenantIds.length > 0 && !this.contentForm.internalId
              ? { tenants: this.selectedTenantIds.map(id => ({ id })) as any }
              : {}),
          },
        },
      })
      .subscribe({
        next: () => {
          this.savingContent = false;
          this.showContentModal = false;
          this.snackBar?.open(
            this.isEditingContent ? 'Conteúdo atualizado com sucesso.' : 'Conteúdo publicado com sucesso.',
            'Fechar',
            { duration: 3000 },
          );
          this.loadDashboard();
        },
        error: () => {
          this.savingContent = false;
          this.snackBar?.open('Erro ao salvar conteúdo no backend.', 'Fechar', { duration: 4000 });
          this.cdr?.markForCheck();
        },
      });
  }

  togglePublish(item: DashboardCmsContentItemDto): void {
    if (!item?.internalId) return;
    const nextStatus: CmsContentStatus = item.status === 'publicado' ? 'rascunho' : 'publicado';
    const previousStatus = item.status;
    item.status = nextStatus;

    const reqObs: Observable<any> | undefined =
      item.sourceEntity === 'SitePage'
        ? this.sitePageService?.sync({
            body: {
              data: {
                internalId: item.internalId,
                status: nextStatus,
                publishedAt: nextStatus === 'publicado' ? new Date().toISOString() : undefined,
              },
            },
          })
        : this.sitePostService?.sync({
            body: {
              data: {
                internalId: item.internalId,
                status: nextStatus,
                publishedAt: nextStatus === 'publicado' ? new Date().toISOString() : undefined,
              },
            },
          });

    reqObs?.subscribe({
      next: () => {
        this.snackBar?.open(
          nextStatus === 'publicado' ? 'Conteúdo publicado.' : 'Conteúdo movido para rascunho.',
          'Fechar',
          { duration: 2500 },
        );
        this.loadDashboard();
      },
      error: () => {
        item.status = previousStatus;
        this.snackBar?.open('Erro ao alterar status do conteúdo.', 'Fechar', { duration: 3500 });
        this.cdr?.markForCheck();
      },
    });
  }

  deleteContent(item: DashboardCmsContentItemDto): void {
    if (!item?.internalId) return;

    const reqObs: Observable<any> | undefined =
      item.sourceEntity === 'SitePage'
        ? this.sitePageService?.delete({ body: { internalId: item.internalId } as any })
        : this.sitePostService?.delete({ body: { internalId: item.internalId } as any });

    reqObs?.subscribe({
      next: () => {
        this.contents = this.contents.filter(
          (c) => !(c.internalId === item.internalId && c.sourceEntity === item.sourceEntity),
        );
        this.snackBar?.open('Conteúdo removido.', 'Fechar', { duration: 2500 });
        this.loadDashboard();
      },
      error: () => {
        this.snackBar?.open('Erro ao excluir conteúdo.', 'Fechar', { duration: 3500 });
        this.cdr?.markForCheck();
      },
    });
  }

  openNewMediaModal(): void {
    this.mediaForm = this.createEmptyMediaForm();
    if (this.selectedWebsiteId !== 'todos') {
      this.mediaForm.websiteId = this.selectedWebsiteId;
    }
    this.showMediaModal = true;
  }

  saveMedia(): void {
    const filename = (this.mediaForm.filename || '').trim();
    const url = (this.mediaForm.url || '').trim();
    if ((!filename && !url) || !this.siteMediaService || this.savingMedia) return;

    this.savingMedia = true;
    const websiteRef = this.mediaForm.websiteId
      ? ({ internalId: this.mediaForm.websiteId } as Website)
      : undefined;

    this.siteMediaService
      .sync({
        body: {
          data: {
            filename: filename || url.split('/').pop() || 'arquivo-midia',
            url: url || filename,
            mediaType: this.mediaForm.mediaType,
            sizeLabel: (this.mediaForm.sizeLabel || '').trim() || undefined,
            altText: (this.mediaForm.altText || '').trim() || undefined,
            website: websiteRef,
            ...(this.selectedTenantIds.length > 0
              ? { tenants: this.selectedTenantIds.map(id => ({ id })) as any }
              : {}),
          },
        },
      })
      .subscribe({
        next: () => {
          this.savingMedia = false;
          this.showMediaModal = false;
          this.snackBar?.open('Mídia cadastrada com sucesso.', 'Fechar', { duration: 3000 });
          this.loadDashboard();
        },
        error: () => {
          this.savingMedia = false;
          this.snackBar?.open('Erro ao salvar mídia no backend.', 'Fechar', { duration: 4000 });
          this.cdr?.markForCheck();
        },
      });
  }

  deleteMedia(media: SiteMedia): void {
    if (!media?.internalId || !this.siteMediaService) return;
    this.siteMediaService.delete({ body: media }).subscribe({
      next: () => {
        this.recentMedia = this.recentMedia.filter((m) => m.internalId !== media.internalId);
        this.snackBar?.open('Mídia removida.', 'Fechar', { duration: 2500 });
        this.loadDashboard();
      },
      error: () => {
        this.snackBar?.open('Erro ao remover mídia.', 'Fechar', { duration: 3500 });
        this.cdr?.markForCheck();
      },
    });
  }

  copyMediaUrl(media: SiteMedia): void {
    const link = media?.url || media?.filename || '';
    if (!link) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(link).then(
        () => this.snackBar?.open('Link copiado para a área de transferência.', 'Fechar', { duration: 2500 }),
        () => this.snackBar?.open(`Link: ${link}`, 'Fechar', { duration: 3500 }),
      );
    } else {
      this.snackBar?.open(`Link: ${link}`, 'Fechar', { duration: 3500 });
    }
  }

  formatMediaDate(media: SiteMedia): string {
    const raw = media?.createdAt;
    if (!raw) return 'Recente';
    const d = new Date(raw as any);
    if (Number.isNaN(d.getTime())) return String(raw);
    return d.toLocaleDateString('pt-BR');
  }

  formatMediaSize(media: SiteMedia): string {
    if (media?.sizeLabel) return media.sizeLabel;
    const bytes = Number(media?.sizeBytes || 0);
    if (!bytes) return '—';
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${bytes} B`;
  }
}
