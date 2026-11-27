import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TenantFilterBarComponent } from '@ci/components';
import {
  Category,
  DashboardSeoDto,
  DashboardSeoKpisDto,
  DashboardSeoTarefasPorStatusDto,
  SeoBackLink,
  SeoBackLinkService,
  SeoCampanha,
  SeoCampanhaService,
  SeoDomain,
  SeoDomainService,
  SeoKeyWord,
  SeoKeyWordService,
  SeoPage,
  SeoPageService,
  SeoService,
  SeoTarefa,
  SeoTarefaService,
  Source,
} from '@ci/portal-api';
import { Subscription } from 'rxjs';

export type SeoDashboardTab =
  | 'paginas'
  | 'palavras'
  | 'backlinks'
  | 'campanhas'
  | 'tarefas'
  | 'tendencias';

export type SeoDialogKind =
  | 'domain'
  | 'page'
  | 'keyword'
  | 'backlink'
  | 'campanha'
  | 'tarefa'
  | null;

@Component({
  selector: 'ci-seo-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatTooltipModule,
    TenantFilterBarComponent,
  ],
  templateUrl: './seo-dashboard.component.html',
  styleUrls: ['./seo-dashboard.component.scss'],
})
export class SeoDashboardComponent implements OnInit, OnDestroy {
  @ViewChild('entityDialog') entityDialog?: ElementRef<HTMLDialogElement>;

  activeTab: SeoDashboardTab = 'paginas';
  selectedDominioId = 'todos';
  selectedTenantIds: string[] = [];
  searchQuery = '';

  dominios: SeoDomain[] = [];
  paginas: SeoPage[] = [];
  pioresPaginas: SeoPage[] = [];
  palavrasChave: SeoKeyWord[] = [];
  backlinks: SeoBackLink[] = [];
  campanhas: SeoCampanha[] = [];
  tarefas: SeoTarefa[] = [];
  fontes: Source[] = [];
  tendencias: Category[] = [];

  kpis: DashboardSeoKpisDto = {
    totalDominios: 0,
    dominiosVerificados: 0,
    totalPaginas: 0,
    paginasIndexaveis: 0,
    scoreMedio: null,
    totalPalavrasChave: 0,
    palavrasTop10: 0,
    totalBacklinks: 0,
    backlinksAtivos: 0,
    totalCampanhas: 0,
    campanhasAtivas: 0,
    totalTarefas: 0,
    tarefasAbertas: 0,
    tarefasEmAndamento: 0,
    tarefasConcluidas: 0,
  };

  tarefasPorStatus: DashboardSeoTarefasPorStatusDto = {
    ABERTA: 0,
    EM_ANDAMENTO: 0,
    CONCLUIDA: 0,
  };

  loading = false;
  saving = false;
  auditingPageId?: string;

  dialogKind: SeoDialogKind = null;
  domainForm: Partial<SeoDomain> = { nome: '', hostname: '', sitemapUrl: '', verificado: false };
  pageForm: { internalId?: string; url: string; titulo: string; metaDescription: string; dominioId: string } = {
    url: '',
    titulo: '',
    metaDescription: '',
    dominioId: '',
  };
  keywordForm: { termo: string; voulePesquisa: number; dificuldadeClassificacao: number; posicaoAtual?: number; dominioId: string } = {
    termo: '',
    voulePesquisa: 100,
    dificuldadeClassificacao: 30,
    posicaoAtual: undefined,
    dominioId: '',
  };
  backlinkForm: { origemUrl: string; enderecoRetorno: string; ancora: string; rel: 'dofollow' | 'nofollow' | 'ugc' | 'sponsored'; paginaId: string } = {
    origemUrl: '',
    enderecoRetorno: '',
    ancora: '',
    rel: 'dofollow',
    paginaId: '',
  };
  campanhaForm: { nome: string; objetivo: string; status: 'PLANEJADA' | 'ATIVA' | 'PAUSADA' | 'CONCLUIDA'; dominioId: string } = {
    nome: '',
    objetivo: '',
    status: 'ATIVA',
    dominioId: '',
  };
  tarefaForm: { titulo: string; descricao: string; prioridade: 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA'; responsavel: string; dominioId: string } = {
    titulo: '',
    descricao: '',
    prioridade: 'MEDIA',
    responsavel: '',
    dominioId: '',
  };

  private dashboardSub?: Subscription;

  constructor(
    @Optional() private readonly seoService?: SeoService,
    @Optional() private readonly domainService?: SeoDomainService,
    @Optional() private readonly pageService?: SeoPageService,
    @Optional() private readonly keyWordService?: SeoKeyWordService,
    @Optional() private readonly backLinkService?: SeoBackLinkService,
    @Optional() private readonly campanhaService?: SeoCampanhaService,
    @Optional() private readonly tarefaService?: SeoTarefaService,
    @Optional() private readonly snackBar?: MatSnackBar,
    @Optional() private readonly cdr?: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  ngOnDestroy(): void {
    this.dashboardSub?.unsubscribe();
  }

  loadDashboard(): void {
    if (!this.seoService || typeof this.seoService.getDashboard !== 'function') {
      return;
    }

    this.loading = true;
    this.dashboardSub?.unsubscribe();
    this.dashboardSub = this.seoService
      .getDashboard({
        body: {
          dominioId: this.selectedDominioId !== 'todos' ? this.selectedDominioId : undefined,
          search: this.searchQuery?.trim() || undefined,
          tenantIds: this.selectedTenantIds.length > 0 ? [...this.selectedTenantIds] : undefined,
        },
      })
      .subscribe({
        next: (res: DashboardSeoDto) => {
          this.loading = false;
          this.dominios = Array.isArray(res?.dominios) ? res.dominios : [];
          this.paginas = Array.isArray(res?.paginas) ? res.paginas : [];
          this.pioresPaginas = Array.isArray(res?.pioresPaginas) ? res.pioresPaginas : [];
          this.palavrasChave = Array.isArray(res?.palavrasChave) ? res.palavrasChave : [];
          this.backlinks = Array.isArray(res?.backlinks) ? res.backlinks : [];
          this.campanhas = Array.isArray(res?.campanhas) ? res.campanhas : [];
          this.tarefas = Array.isArray(res?.tarefas) ? res.tarefas : [];
          this.fontes = Array.isArray(res?.fontes) ? res.fontes : [];
          this.tendencias = Array.isArray(res?.tendencias) ? res.tendencias : [];
          if (res?.kpis) {
            this.kpis = res.kpis;
          }
          if (res?.tarefasPorStatus) {
            this.tarefasPorStatus = res.tarefasPorStatus;
          }
          this.cdr?.markForCheck();
          this.cdr?.detectChanges();
        },
        error: () => {
          this.loading = false;
          this.snackBar?.open('Não foi possível carregar o dashboard de SEO.', 'Fechar', { duration: 4000 });
          this.cdr?.markForCheck();
          this.cdr?.detectChanges();
        },
      });
  }

  onDominioFilterChange(): void {
    this.loadDashboard();
  }

  onTenantFilterChange(tenantIds: string[]): void {
    this.selectedTenantIds = Array.isArray(tenantIds) ? tenantIds : [];
    this.loadDashboard();
  }

  selectTab(tab: SeoDashboardTab): void {
    this.activeTab = tab;
  }

  get filteredPaginas(): SeoPage[] {
    const q = (this.searchQuery || '').trim().toLowerCase();
    if (!q) return this.paginas;
    return this.paginas.filter(p =>
      (p.url || '').toLowerCase().includes(q) ||
      (p.titulo || '').toLowerCase().includes(q) ||
      (p.metaDescription || '').toLowerCase().includes(q),
    );
  }

  get filteredPalavras(): SeoKeyWord[] {
    const q = (this.searchQuery || '').trim().toLowerCase();
    if (!q) return this.palavrasChave;
    return this.palavrasChave.filter(k => (k.termo || '').toLowerCase().includes(q));
  }

  get filteredBacklinks(): SeoBackLink[] {
    const q = (this.searchQuery || '').trim().toLowerCase();
    if (!q) return this.backlinks;
    return this.backlinks.filter(b =>
      (b.origemUrl || '').toLowerCase().includes(q) ||
      (b.enderecoRetorno || '').toLowerCase().includes(q) ||
      (b.ancora || '').toLowerCase().includes(q),
    );
  }

  get filteredCampanhas(): SeoCampanha[] {
    const q = (this.searchQuery || '').trim().toLowerCase();
    if (!q) return this.campanhas;
    return this.campanhas.filter(c =>
      (c.nome || '').toLowerCase().includes(q) ||
      (c.objetivo || '').toLowerCase().includes(q),
    );
  }

  get filteredTarefas(): SeoTarefa[] {
    const q = (this.searchQuery || '').trim().toLowerCase();
    if (!q) return this.tarefas;
    return this.tarefas.filter(t =>
      (t.titulo || '').toLowerCase().includes(q) ||
      (t.descricao || '').toLowerCase().includes(q) ||
      (t.codigoIssue || '').toLowerCase().includes(q),
    );
  }

  getTarefasPorStatus(status: 'ABERTA' | 'EM_ANDAMENTO' | 'CONCLUIDA'): SeoTarefa[] {
    return this.filteredTarefas.filter(t => (t.status || 'ABERTA') === status);
  }

  getScoreClass(score?: number | null): string {
    if (score === null || score === undefined) return 'score-none';
    if (score >= 80) return 'score-good';
    if (score >= 50) return 'score-warn';
    return 'score-bad';
  }

  getKeywordDelta(kw: SeoKeyWord): number | null {
    if (kw.posicaoAtual == null || kw.posicaoAnterior == null) return null;
    return kw.posicaoAnterior - kw.posicaoAtual;
  }

  auditarPagina(page: SeoPage): void {
    if (!page?.internalId || !this.seoService || typeof this.seoService.auditarPagina !== 'function') return;
    this.auditingPageId = page.internalId;
    this.seoService.auditarPagina({ body: { internalId: page.internalId } }).subscribe({
      next: () => {
        this.auditingPageId = undefined;
        this.snackBar?.open('Auditoria concluída com sucesso.', 'OK', { duration: 3000 });
        this.loadDashboard();
      },
      error: () => {
        this.auditingPageId = undefined;
        this.snackBar?.open('Erro ao executar auditoria da página.', 'Fechar', { duration: 4000 });
        this.cdr?.markForCheck();
      },
    });
  }

  moverTarefa(tarefa: SeoTarefa, status: 'ABERTA' | 'EM_ANDAMENTO' | 'CONCLUIDA'): void {
    if (!tarefa?.internalId || !this.seoService || typeof this.seoService.moverTarefa !== 'function') return;
    const previous = tarefa.status;
    tarefa.status = status;
    this.seoService.moverTarefa({ body: { internalId: tarefa.internalId, status } }).subscribe({
      next: () => {
        this.snackBar?.open('Status da tarefa atualizado.', 'OK', { duration: 2500 });
        this.loadDashboard();
      },
      error: () => {
        tarefa.status = previous;
        this.snackBar?.open('Erro ao mover tarefa SEO.', 'Fechar', { duration: 3500 });
        this.cdr?.markForCheck();
      },
    });
  }

  openDialog(kind: Exclude<SeoDialogKind, null>): void {
    this.dialogKind = kind;
    const defaultDominioId = this.selectedDominioId !== 'todos' ? this.selectedDominioId : (this.dominios[0]?.internalId || '');

    if (kind === 'domain') {
      this.domainForm = { nome: '', hostname: '', sitemapUrl: '', verificado: false };
    } else if (kind === 'page') {
      this.pageForm = { url: '', titulo: '', metaDescription: '', dominioId: defaultDominioId };
    } else if (kind === 'keyword') {
      this.keywordForm = { termo: '', voulePesquisa: 100, dificuldadeClassificacao: 30, posicaoAtual: undefined, dominioId: defaultDominioId };
    } else if (kind === 'backlink') {
      this.backlinkForm = { origemUrl: '', enderecoRetorno: '', ancora: '', rel: 'dofollow', paginaId: this.paginas[0]?.internalId || '' };
    } else if (kind === 'campanha') {
      this.campanhaForm = { nome: '', objetivo: '', status: 'ATIVA', dominioId: defaultDominioId };
    } else if (kind === 'tarefa') {
      this.tarefaForm = { titulo: '', descricao: '', prioridade: 'MEDIA', responsavel: '', dominioId: defaultDominioId };
    }

    const dlg = this.entityDialog?.nativeElement;
    if (dlg && typeof dlg.showModal === 'function' && !dlg.open) {
      dlg.showModal();
    }
  }

  closeDialog(): void {
    const dlg = this.entityDialog?.nativeElement;
    if (dlg && dlg.open) {
      dlg.close();
      dlg.returnValue = '';
    }
    this.dialogKind = null;
  }

  onDialogClosed(): void {
    const dlg = this.entityDialog?.nativeElement;
    if (dlg) {
      dlg.returnValue = '';
    }
    this.dialogKind = null;
  }

  get dialogTitle(): string {
    switch (this.dialogKind) {
      case 'domain': return 'Novo Domínio SEO';
      case 'page': return 'Nova Página Monitorada';
      case 'keyword': return 'Nova Palavra-chave';
      case 'backlink': return 'Novo Backlink';
      case 'campanha': return 'Nova Campanha SEO';
      case 'tarefa': return 'Nova Tarefa SEO';
      default: return 'Cadastro SEO';
    }
  }

  private get tenantRefs(): Array<{ id: string }> | undefined {
    if (this.selectedTenantIds.length === 0) return undefined;
    return this.selectedTenantIds.map(id => ({ id }));
  }

  saveDialog(): void {
    if (this.saving || !this.dialogKind) return;
    const tenants = this.tenantRefs;

    if (this.dialogKind === 'domain') {
      if (!this.domainForm.hostname?.trim() || !this.domainService) return;
      this.saving = true;
      this.domainService.sync({
        body: {
          data: {
            nome: this.domainForm.nome?.trim() || this.domainForm.hostname.trim(),
            hostname: this.domainForm.hostname.trim(),
            sitemapUrl: this.domainForm.sitemapUrl?.trim() || undefined,
            verificado: Boolean(this.domainForm.verificado),
            ...(tenants ? { tenants: tenants as any } : {}),
          },
        },
      }).subscribe(this.handleSaveObserver('Domínio SEO cadastrado.'));
      return;
    }

    if (this.dialogKind === 'page') {
      if (!this.pageForm.url?.trim() || !this.pageService) return;
      this.saving = true;
      this.pageService.sync({
        body: {
          data: {
            internalId: this.pageForm.internalId || undefined,
            url: this.pageForm.url.trim(),
            titulo: this.pageForm.titulo?.trim() || undefined,
            metaDescription: this.pageForm.metaDescription?.trim() || undefined,
            dominio: this.pageForm.dominioId ? ({ internalId: this.pageForm.dominioId } as SeoDomain) : undefined,
            ...(tenants ? { tenants: tenants as any } : {}),
          },
        },
      }).subscribe(this.handleSaveObserver('Página SEO salva.'));
      return;
    }

    if (this.dialogKind === 'keyword') {
      if (!this.keywordForm.termo?.trim() || !this.keyWordService) return;
      this.saving = true;
      this.keyWordService.sync({
        body: {
          data: {
            termo: this.keywordForm.termo.trim(),
            voulePesquisa: Number(this.keywordForm.voulePesquisa) || 0,
            dificuldadeClassificacao: Number(this.keywordForm.dificuldadeClassificacao) || 0,
            posicaoAtual: this.keywordForm.posicaoAtual !== undefined ? Number(this.keywordForm.posicaoAtual) : undefined,
            dominio: this.keywordForm.dominioId ? ({ internalId: this.keywordForm.dominioId } as SeoDomain) : undefined,
            ...(tenants ? { tenants: tenants as any } : {}),
          },
        },
      }).subscribe(this.handleSaveObserver('Palavra-chave cadastrada.'));
      return;
    }

    if (this.dialogKind === 'backlink') {
      if (!this.backlinkForm.origemUrl?.trim() || !this.backLinkService) return;
      this.saving = true;
      this.backLinkService.sync({
        body: {
          data: {
            origemUrl: this.backlinkForm.origemUrl.trim(),
            enderecoRetorno: this.backlinkForm.enderecoRetorno?.trim() || undefined,
            ancora: this.backlinkForm.ancora?.trim() || undefined,
            rel: this.backlinkForm.rel,
            ativo: true,
            pagina: this.backlinkForm.paginaId ? ({ internalId: this.backlinkForm.paginaId } as SeoPage) : undefined,
            ...(tenants ? { tenants: tenants as any } : {}),
          },
        },
      }).subscribe(this.handleSaveObserver('Backlink registrado.'));
      return;
    }

    if (this.dialogKind === 'campanha') {
      if (!this.campanhaForm.nome?.trim() || !this.campanhaService) return;
      this.saving = true;
      this.campanhaService.sync({
        body: {
          data: {
            nome: this.campanhaForm.nome.trim(),
            objetivo: this.campanhaForm.objetivo?.trim() || undefined,
            status: this.campanhaForm.status,
            dominio: this.campanhaForm.dominioId ? ({ internalId: this.campanhaForm.dominioId } as SeoDomain) : undefined,
            ...(tenants ? { tenants: tenants as any } : {}),
          },
        },
      }).subscribe(this.handleSaveObserver('Campanha SEO salva.'));
      return;
    }

    if (this.dialogKind === 'tarefa') {
      if (!this.tarefaForm.titulo?.trim() || !this.tarefaService) return;
      this.saving = true;
      this.tarefaService.sync({
        body: {
          data: {
            titulo: this.tarefaForm.titulo.trim(),
            descricao: this.tarefaForm.descricao?.trim() || undefined,
            prioridade: this.tarefaForm.prioridade,
            responsavel: this.tarefaForm.responsavel?.trim() || undefined,
            status: 'ABERTA',
            dominio: this.tarefaForm.dominioId ? ({ internalId: this.tarefaForm.dominioId } as SeoDomain) : undefined,
            ...(tenants ? { tenants: tenants as any } : {}),
          },
        },
      }).subscribe(this.handleSaveObserver('Tarefa SEO criada.'));
    }
  }

  private handleSaveObserver(successMessage: string) {
    return {
      next: () => {
        this.saving = false;
        this.closeDialog();
        this.snackBar?.open(successMessage, 'OK', { duration: 3000 });
        this.loadDashboard();
      },
      error: () => {
        this.saving = false;
        this.snackBar?.open('Erro ao salvar registro SEO no backend.', 'Fechar', { duration: 4000 });
        this.cdr?.markForCheck();
      },
    };
  }

  deletePage(page: SeoPage): void {
    if (!page?.internalId || !this.pageService) return;
    this.pageService.delete({ body: page }).subscribe({
      next: () => {
        this.snackBar?.open('Página removida.', 'OK', { duration: 2500 });
        this.loadDashboard();
      },
      error: () => this.snackBar?.open('Erro ao remover página.', 'Fechar', { duration: 3500 }),
    });
  }

  deleteKeyword(kw: SeoKeyWord): void {
    if (!kw?.internalId || !this.keyWordService) return;
    this.keyWordService.delete({ body: kw }).subscribe({
      next: () => {
        this.snackBar?.open('Palavra-chave removida.', 'OK', { duration: 2500 });
        this.loadDashboard();
      },
      error: () => this.snackBar?.open('Erro ao remover palavra-chave.', 'Fechar', { duration: 3500 }),
    });
  }

  deleteBacklink(bl: SeoBackLink): void {
    if (!bl?.internalId || !this.backLinkService) return;
    this.backLinkService.delete({ body: bl }).subscribe({
      next: () => {
        this.snackBar?.open('Backlink removido.', 'OK', { duration: 2500 });
        this.loadDashboard();
      },
      error: () => this.snackBar?.open('Erro ao remover backlink.', 'Fechar', { duration: 3500 }),
    });
  }

  deleteTarefa(tarefa: SeoTarefa): void {
    if (!tarefa?.internalId || !this.tarefaService) return;
    this.tarefaService.delete({ body: tarefa }).subscribe({
      next: () => {
        this.snackBar?.open('Tarefa removida.', 'OK', { duration: 2500 });
        this.loadDashboard();
      },
      error: () => this.snackBar?.open('Erro ao remover tarefa.', 'Fechar', { duration: 3500 }),
    });
  }
}
