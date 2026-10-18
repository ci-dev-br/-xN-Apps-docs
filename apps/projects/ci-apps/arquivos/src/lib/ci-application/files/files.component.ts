import { Component, Optional, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Apps, CoreModule, IAppInteractionMatch, IconLoaderSerices, LoadIconsModule } from '@ci/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { FileDto, FileExplorerService, ReadDirectoryOutput } from '@ci/portal-api';
import { lastValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  ArquivoFilterType,
  ArquivoSortField,
  ArquivoViewMode,
  IArquivo,
  IBreadcrumbSegment,
  IExplorerTab,
  IQuickLocation,
} from './i-file';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DataGridModule, IDataGridOptions, SelectEvent } from '@ci/components/data-grid';

const STORAGE_KEYS = {
  HISTORY: 'Arquivos.HistoryFiles',
  ADDRESS: 'Arquivos.Endereco',
  VIEW_MODE: 'Arquivos.ViewMode',
  FAVORITES: 'Arquivos.Favoritos',
  GROUP_BY_TYPE: 'Arquivos.GroupByType',
  SIDEBAR_OPEN: 'Arquivos.SidebarOpen',
};

const FILE_TYPE_LABELS: Record<string, string> = {
  '.ts': 'Arquivo TypeScript',
  '.js': 'Arquivo JavaScript',
  '.mjs': 'Módulo JavaScript',
  '.cjs': 'Módulo CommonJS',
  '.json': 'Arquivo JSON',
  '.html': 'Documento HTML',
  '.scss': 'Folha de Estilo SASS',
  '.css': 'Folha de Estilo CSS',
  '.md': 'Documento Markdown',
  '.svg': 'Imagem Vetorial SVG',
  '.png': 'Imagem PNG',
  '.jpg': 'Imagem JPEG',
  '.jpeg': 'Imagem JPEG',
  '.webp': 'Imagem WebP',
  '.ico': 'Ícone',
  '.yml': 'Configuração YAML',
  '.yaml': 'Configuração YAML',
  '.xml': 'Documento XML',
  '.sql': 'Script SQL',
  '.sh': 'Script Shell',
  '.ps1': 'Script PowerShell',
  '.env': 'Variáveis de Ambiente',
  '.txt': 'Documento de Texto',
  '.log': 'Arquivo de Log',
  '.lock': 'Arquivo de Lock',
};

@Component({
  selector: 'ci-files',
  imports: [
    CoreModule,
    DataGridModule,
    MatTabsModule,
    MatToolbarModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    FormsModule,
    LoadIconsModule,
    RouterModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule,
    MatProgressBarModule,
  ],
  standalone: true,
  templateUrl: './files.component.html',
  styleUrl: './files.component.scss'
})
export class FilesComponent implements OnInit, OnDestroy {
  isLoading = false;
  errorMessage?: string;

  /** Endereço atual normalizado */
  endereco: string = './';
  /** Valor editável na barra de endereço */
  enderecoInput: string = './';
  /** Alterna entre o modo Breadcrumb clicável e o campo de texto de endereço */
  editandoEndereco = false;

  /** Histórico persistido de caminhos visitados para autocomplete */
  historico: string[] = [];
  /** Pilha de navegação (voltar/avançar) e ponteiro atual */
  navegacao: string[] = [];
  indiceNavegacao = -1;

  /** Abas abertas no explorador */
  tabs: IExplorerTab[] = [
    { id: 'tab-1', title: 'Raiz (./)', path: './' }
  ];
  activeTabIndex = 0;

  /** Lista bruta do diretório atual e lista processada para exibição */
  files: IArquivo[] = [];
  filteredFiles?: IArquivo[];
  displayedFiles: IArquivo[] = [];
  foldersList: IArquivo[] = [];
  filesList: IArquivo[] = [];

  /** Item atualmente selecionado, aplicativos compatíveis via manifest de rotas e pré-visualização */
  selectedFile?: IArquivo;
  compatibleApps: IAppInteractionMatch[] = [];
  preferredApp?: IAppInteractionMatch;
  showDetailsPane = false;
  previewLoading = false;
  previewContent?: string;
  previewFileDto?: FileDto;

  /** Controle do painel lateral de navegação rápida e árvore */
  showSidebar = true;
  expandedTreePaths = new Set<string>();

  /** Locais rápidos padrão do workspace */
  quickLocations: IQuickLocation[] = [
    { label: 'Raiz do Workspace (../)', path: '../', icon: 'home' },
    { label: 'Aplicações Cliente (/apps)', path: '../apps', icon: 'web' },
    { label: 'Projetos & Libs (/apps/projects)', path: '../apps/projects', icon: 'widgets' },
    { label: 'Backend NestJS (./)', path: './', icon: 'dns' },
    { label: 'Bibliotecas Server (./libs)', path: './libs', icon: 'storage' },
    { label: 'Documentação (/docs)', path: '../docs', icon: 'menu_book' },
    { label: 'Automação Gulp (/gulp)', path: '../gulp', icon: 'build_circle' },
  ];

  /** Locais favoritados pelo usuário */
  favoritos: IQuickLocation[] = [];

  /** Modos de visão disponíveis */
  viewModes: { mode: ArquivoViewMode; label: string; icon: string; shortLabel: string }[] = [
    { mode: 'grid', label: 'Grade de Dados (DataGrid)', shortLabel: 'DataGrid', icon: 'table_chart' },
    { mode: 'extra-large', label: 'Miniaturas Extra Grandes', shortLabel: 'Extra Grandes', icon: 'grid_view' },
    { mode: 'large', label: 'Miniaturas Grandes', shortLabel: 'Grandes', icon: 'apps' },
    { mode: 'medium', label: 'Miniaturas Médias', shortLabel: 'Médias', icon: 'view_module' },
    { mode: 'small', label: 'Miniaturas Pequenas', shortLabel: 'Pequenas', icon: 'view_comfy' },
    { mode: 'list', label: 'Lista Compacta', shortLabel: 'Lista', icon: 'format_list_bulleted' },
    { mode: 'tiles', label: 'Blocos Lado a Lado (Cards)', shortLabel: 'Blocos', icon: 'dashboard' },
    { mode: 'content', label: 'Conteúdo Detalhado', shortLabel: 'Conteúdo', icon: 'view_agenda' },
  ];

  private _viewMode: ArquivoViewMode = 'medium';
  public get viewMode(): ArquivoViewMode {
    return this._viewMode;
  }
  public set viewMode(value: ArquivoViewMode) {
    if (!value || this._viewMode === value) return;
    this._viewMode = value;
    localStorage.setItem(STORAGE_KEYS.VIEW_MODE, value);
  }

  /** Filtros e Ordenação */
  filterType: ArquivoFilterType = 'all';
  sortBy: ArquivoSortField = 'name';
  sortDirection: 'ASC' | 'DESC' = 'ASC';
  foldersFirst = true;
  groupByType = true;

  /** Configuração do @ci/components/data-grid */
  gridOptions: IDataGridOptions<IArquivo> = {
    columns: [
      { fieldName: 'name', headerName: 'Nome', defaultVisible: true },
      { fieldName: 'tipo', headerName: 'Tipo', defaultVisible: true },
      { fieldName: 'extensao', headerName: 'Extensão', defaultVisible: true },
      { fieldName: 'itensCount', headerName: 'Subitens', defaultVisible: true },
      { fieldName: 'atributos', headerName: 'Atributos', defaultVisible: true },
      { fieldName: 'caminho', headerName: 'Caminho', defaultVisible: true },
    ]
  };

  private lastGridClickTime = 0;
  private lastGridClickedItem?: IArquivo;

  constructor(
    private readonly fileExplorer: FileExplorerService,
    iconLoader: IconLoaderSerices,
    @Optional() private readonly appsService?: Apps,
    @Optional() public readonly dialogRef?: MatDialogRef<FilesComponent, IArquivo>,
    @Optional() private readonly activatedRoute?: ActivatedRoute,
    @Optional() private readonly router?: Router,
  ) {
    iconLoader.load({
      'i8-folder': { url: '/icons8/icons8-folder.svg' },
      'i8-file': { url: '/icons8/icons8-file.svg' },
    });
  }

  ngOnInit() {
    this.restaurarPreferencias();
    // Pré-aquece o catálogo de metadados de rotas dos aplicativos disponíveis
    this.appsService?.getRoutesMetadata();

    const queryPath = this.activatedRoute?.snapshot?.queryParams?.['path']
      || this.activatedRoute?.snapshot?.queryParams?.['dir'];

    const inicial = queryPath || this.endereco || './';
    this.ir(inicial);

    this.activatedRoute?.queryParams.subscribe(async (query: any) => {
      if (query?.path && query.path !== this.endereco) {
        await this.ir(query.path);
      }
      if (query?.file) {
        await this.carregarPreviewPorCaminho(query.file);
      }
    });
  }

  ngOnDestroy() {
    this.salvarPreferencias();
  }

  private restaurarPreferencias() {
    try {
      const savedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed)) {
          this.historico = Array.from(new Set(parsed.filter(Boolean))).slice(-30);
        }
      }

      const savedAddress = localStorage.getItem(STORAGE_KEYS.ADDRESS);
      if (savedAddress) {
        const parsedAddr = JSON.parse(savedAddress);
        if (typeof parsedAddr === 'string' && parsedAddr.trim().length > 0) {
          this.endereco = parsedAddr.trim();
          this.enderecoInput = this.endereco;
        }
      }

      const savedView = localStorage.getItem(STORAGE_KEYS.VIEW_MODE) as ArquivoViewMode | null;
      if (savedView && this.viewModes.some(v => v.mode === savedView)) {
        this._viewMode = savedView;
      }

      const savedFavs = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      if (savedFavs) {
        const parsedFavs = JSON.parse(savedFavs);
        if (Array.isArray(parsedFavs)) {
          this.favoritos = parsedFavs;
        }
      }

      const savedGroup = localStorage.getItem(STORAGE_KEYS.GROUP_BY_TYPE);
      if (savedGroup !== null) {
        this.groupByType = savedGroup === 'true';
      }

      const savedSidebar = localStorage.getItem(STORAGE_KEYS.SIDEBAR_OPEN);
      if (savedSidebar !== null) {
        this.showSidebar = savedSidebar === 'true';
      }
    } catch (e) {
      console.trace(e);
    }
  }

  private salvarPreferencias() {
    try {
      if (this.endereco) {
        localStorage.setItem(STORAGE_KEYS.ADDRESS, JSON.stringify(this.endereco));
      }
      if (this.historico?.length) {
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(this.historico.slice(-30)));
      }
      localStorage.setItem(STORAGE_KEYS.VIEW_MODE, this._viewMode);
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(this.favoritos));
      localStorage.setItem(STORAGE_KEYS.GROUP_BY_TYPE, String(this.groupByType));
      localStorage.setItem(STORAGE_KEYS.SIDEBAR_OPEN, String(this.showSidebar));
    } catch (e) {
      console.trace(e);
    }
  }

  private _filtrar?: string;
  public get filtrar(): string | undefined {
    return this._filtrar;
  }
  public set filtrar(value: string | undefined) {
    if (this._filtrar === value) return;
    this._filtrar = value;
    this.atualizarListaExibida();
  }

  get canGoBack(): boolean {
    return this.indiceNavegacao > 0;
  }

  get canGoForward(): boolean {
    return this.indiceNavegacao >= 0 && this.indiceNavegacao < this.navegacao.length - 1;
  }

  get isFavoritoAtual(): boolean {
    const norm = this.normalizarCaminho(this.endereco);
    return this.favoritos.some(f => this.normalizarCaminho(f.path) === norm);
  }

  get breadcrumbs(): IBreadcrumbSegment[] {
    const raw = (this.endereco || './').replace(/\\/g, '/').replace(/\/+$/, '');
    if (!raw || raw === '.' || raw === './') {
      return [{ name: 'Raiz (./)', path: './' }];
    }
    if (raw === '..' || raw === '../') {
      return [{ name: 'Workspace (../)', path: '../' }];
    }

    const parts = raw.split('/').filter(Boolean);
    const segments: IBreadcrumbSegment[] = [];

    if (raw.startsWith('/')) {
      segments.push({ name: '/', path: '/' });
    } else if (parts[0] !== '.' && parts[0] !== '..' && !parts[0].includes(':')) {
      segments.push({ name: 'Raiz (./)', path: './' });
    }

    let acc = raw.startsWith('/') ? '' : '';
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === 0 && part === '.') {
        segments.push({ name: 'Raiz (./)', path: './' });
        acc = '.';
        continue;
      }
      if (i === 0 && part === '..') {
        segments.push({ name: 'Workspace (../)', path: '../' });
        acc = '..';
        continue;
      }
      acc = acc ? `${acc}/${part}` : part;
      segments.push({
        name: part,
        path: acc,
      });
    }

    return segments.length > 0 ? segments : [{ name: 'Raiz (./)', path: './' }];
  }

  get currentViewInfo() {
    return this.viewModes.find(v => v.mode === this.viewMode) || this.viewModes[3];
  }

  normalizarCaminho(caminho?: string | null): string {
    if (!caminho || !caminho.trim()) return './';
    let limpo = caminho.trim().replace(/\\/g, '/');
    if (limpo === '.') return './';
    if (limpo === '..') return '../';
    if (
      !limpo.startsWith('./') &&
      !limpo.startsWith('../') &&
      !limpo.startsWith('/') &&
      !/^[a-zA-Z]:/.test(limpo)
    ) {
      limpo = `./${limpo}`;
    }
    if (limpo.length > 3 && limpo.endsWith('/') && !limpo.endsWith(':/') && !limpo.endsWith('../')) {
      return limpo.replace(/\/+$/, '');
    }
    return limpo;
  }

  private resolverCaminhoFilho(parentDir: string, rawChildPath?: string | null, childName?: string | null): string {
    if (rawChildPath && rawChildPath.trim()) {
      const limpo = rawChildPath.trim().replace(/\\/g, '/');
      if (limpo.startsWith('./') || limpo.startsWith('../') || limpo.startsWith('/') || /^[a-zA-Z]:/.test(limpo)) {
        return this.normalizarCaminho(limpo);
      }
      return this.normalizarCaminho(`./${limpo}`);
    }
    const base = this.normalizarCaminho(parentDir).replace(/\/+$/, '');
    return this.normalizarCaminho(`${base}/${childName || ''}`);
  }

  obterTituloPasta(caminho: string): string {
    const norm = this.normalizarCaminho(caminho);
    if (norm === './' || norm === '.') return 'Raiz (./)';
    if (norm === '../' || norm === '..') return 'Workspace (../)';
    if (norm === '/') return 'Raiz (/)';
    const partes = norm.split('/').filter(p => Boolean(p) && p !== '.' && p !== '..');
    return partes[partes.length - 1] || norm;
  }

  private enriquecerArquivo(f: ReadDirectoryOutput & { children?: any[] }): IArquivo {
    const isDirectory = Boolean(f.isDirectory || (f.name && f.isFile === false && f.name.indexOf('.') === -1));
    const isFile = Boolean(f.isFile || !isDirectory);
    const name = f.name || 'DESCONHECIDO';
    const caminho = this.resolverCaminhoFilho(this.endereco, f.path, name);
    f.path = caminho;

    let extensao = '';
    if (!isDirectory && name.includes('.')) {
      const lastDot = name.lastIndexOf('.');
      if (lastDot > 0) {
        extensao = name.substring(lastDot).toLowerCase();
      } else if (lastDot === 0) {
        extensao = name.toLowerCase();
      }
    }

    const tipo = isDirectory
      ? 'Pasta de arquivos'
      : (FILE_TYPE_LABELS[extensao] || (extensao ? `Arquivo ${extensao.substring(1).toUpperCase()}` : 'Arquivo'));

    const childrenArr = Array.isArray((f as any).children)
      ? (f as any).children.map((c: any) => ({
        ...c,
        path: this.resolverCaminhoFilho(caminho, c?.path, c?.name),
      }))
      : undefined;
    if (childrenArr) {
      (f as any).children = childrenArr;
    }

    const itensCount = isDirectory
      ? (childrenArr !== undefined ? `${childrenArr.length} ${childrenArr.length === 1 ? 'item' : 'itens'}` : 'Pasta')
      : '-';

    const flags: string[] = [];
    flags.push(isDirectory ? 'Diretório' : 'Arquivo');
    if (f.isSymbolicLink) flags.push('Link Simbólico');
    if (f.isSocket) flags.push('Socket');
    if (f.isFIFO) flags.push('FIFO');

    return {
      iconType: 'svg',
      icon: isDirectory ? 'i8-folder' : isFile ? 'i8-file' : 'unknown_document',
      name,
      info: f,
      isDirectory,
      isFile,
      tipo,
      extensao: extensao || (isDirectory ? '<DIR>' : '-'),
      caminho,
      itensCount,
      atributos: flags.join(' • '),
    };
  }

  async ir(enderecoDestino: string, registrarNaPilha = true) {
    const alvo = this.normalizarCaminho(enderecoDestino);
    this.isLoading = true;
    this.errorMessage = undefined;
    const enderecoAnterior = this.endereco;

    try {
      this.endereco = alvo;
      this.enderecoInput = alvo;
      this.editandoEndereco = false;

      const resultado = await lastValueFrom(
        this.fileExplorer.readDirectory({ body: { path: alvo } })
      );

      if (resultado === null || resultado === undefined) {
        throw new Error(`Não foi possível acessar o diretório "${alvo}" (inexistente ou sem permissão).`);
      }

      if (!this.historico.includes(alvo)) {
        this.historico = [alvo, ...this.historico.filter(h => h !== alvo)].slice(0, 30);
      }

      if (registrarNaPilha) {
        if (this.indiceNavegacao < this.navegacao.length - 1) {
          this.navegacao = this.navegacao.slice(0, this.indiceNavegacao + 1);
        }
        if (this.navegacao[this.navegacao.length - 1] !== alvo) {
          this.navegacao.push(alvo);
          this.indiceNavegacao = this.navegacao.length - 1;
        }
      }

      if (this.tabs[this.activeTabIndex]) {
        this.tabs[this.activeTabIndex].path = alvo;
        this.tabs[this.activeTabIndex].title = this.obterTituloPasta(alvo);
      }

      this.files = (resultado || []).map(f => this.enriquecerArquivo(f));
      this.selectedFile = undefined;
      this.atualizarListaExibida();
      this.salvarPreferencias();
    } catch (error: any) {
      console.trace(error);
      this.errorMessage = error?.message || `Falha ao explorar o caminho "${alvo}".`;
      if (enderecoAnterior && enderecoAnterior !== alvo) {
        this.endereco = enderecoAnterior;
        this.enderecoInput = enderecoAnterior;
      }
    } finally {
      this.isLoading = false;
    }
  }

  atualizarListaExibida() {
    let lista = [...(this.files || [])];

    // 1. Filtro por tipo (Todos / Pastas / Arquivos)
    if (this.filterType === 'folders') {
      lista = lista.filter(item => item.isDirectory);
    } else if (this.filterType === 'files') {
      lista = lista.filter(item => !item.isDirectory);
    }

    // 2. Filtro por texto/busca seguro
    const termo = (this._filtrar || '').trim();
    if (termo.length > 0) {
      const lower = termo.toLowerCase();
      let regex: RegExp | null = null;
      try {
        regex = new RegExp(termo, 'i');
      } catch {
        regex = null;
      }

      lista = lista.filter(file => {
        const nome = (file.name || '').toLowerCase();
        const tipo = (file.tipo || '').toLowerCase();
        const ext = (file.extensao || '').toLowerCase();
        return (
          nome.includes(lower) ||
          tipo.includes(lower) ||
          ext.includes(lower) ||
          (regex ? regex.test(file.name || '') : false)
        );
      });
      this.filteredFiles = lista;
    } else {
      this.filteredFiles = undefined;
    }

    // 3. Ordenação
    const dirFactor = this.sortDirection === 'ASC' ? 1 : -1;
    lista.sort((a, b) => {
      if (this.foldersFirst && a.isDirectory !== b.isDirectory) {
        return a.isDirectory ? -1 : 1;
      }
      const valA = String((a as any)[this.sortBy] ?? a.name ?? '').toLowerCase();
      const valB = String((b as any)[this.sortBy] ?? b.name ?? '').toLowerCase();
      return valA.localeCompare(valB, 'pt-BR', { numeric: true }) * dirFactor;
    });

    this.displayedFiles = [...lista];
    this.foldersList = this.displayedFiles.filter(f => f.isDirectory);
    this.filesList = this.displayedFiles.filter(f => !f.isDirectory);
  }

  definirFiltroTipo(tipo: ArquivoFilterType) {
    this.filterType = tipo;
    this.atualizarListaExibida();
  }

  definirOrdenacao(campo: ArquivoSortField) {
    if (this.sortBy === campo) {
      this.sortDirection = this.sortDirection === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.sortBy = campo;
      this.sortDirection = 'ASC';
    }
    this.atualizarListaExibida();
  }

  alternarDirecaoOrdenacao() {
    this.sortDirection = this.sortDirection === 'ASC' ? 'DESC' : 'ASC';
    this.atualizarListaExibida();
  }

  alternarAgrupamento() {
    this.groupByType = !this.groupByType;
    this.salvarPreferencias();
  }

  alternarSidebar() {
    this.showSidebar = !this.showSidebar;
    this.salvarPreferencias();
  }

  alternarPainelDetalhes() {
    this.showDetailsPane = !this.showDetailsPane;
    if (this.showDetailsPane && this.selectedFile && this.selectedFile.isFile) {
      this.carregarPreviewArquivo(this.selectedFile);
    }
  }

  recarregar() {
    this.ir(this.endereco || './', false);
  }

  async voltar() {
    const atual = this.normalizarCaminho(this.endereco);
    if (!atual || atual === './' || atual === '.') {
      return this.ir('../');
    }
    if (atual.endsWith('../') || atual.endsWith('..')) {
      const base = atual.endsWith('/') ? atual : `${atual}/`;
      return this.ir(`${base}../`);
    }

    const partes = atual.split('/').filter(Boolean);
    if (partes.length <= 1) {
      if (atual.startsWith('/')) return this.ir('/');
      return this.ir('./');
    }

    partes.pop();
    const prefixo = atual.startsWith('/') ? '/' : '';
    const novoCaminho = prefixo + partes.join('/');
    return this.ir(novoCaminho || './');
  }

  back() {
    if (!this.canGoBack) return;
    this.indiceNavegacao--;
    const destino = this.navegacao[this.indiceNavegacao];
    if (destino) {
      this.ir(destino, false);
    }
  }

  forward() {
    if (!this.canGoForward) return;
    this.indiceNavegacao++;
    const destino = this.navegacao[this.indiceNavegacao];
    if (destino) {
      this.ir(destino, false);
    }
  }

  irParaIndiceHistorico(index: number) {
    if (index >= 0 && index < this.navegacao.length) {
      this.indiceNavegacao = index;
      this.ir(this.navegacao[index], false);
    }
  }

  limparHistorico() {
    this.historico = [this.endereco];
    this.navegacao = [this.endereco];
    this.indiceNavegacao = 0;
    this.salvarPreferencias();
  }

  ativarEdicaoEndereco(inputEl?: HTMLInputElement) {
    this.enderecoInput = this.endereco;
    this.editandoEndereco = true;
    setTimeout(() => inputEl?.focus(), 50);
  }

  confirmarEnderecoInput() {
    this.editandoEndereco = false;
    if (this.enderecoInput && this.enderecoInput.trim()) {
      this.ir(this.enderecoInput.trim());
    }
  }

  async clicarItem(file: IArquivo, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    if (file?.isDirectory || file?.info?.isDirectory) {
      await this.abrir(file, event);
      return;
    }
    await this.selecionar(file, event);
  }

  async selecionar(file?: IArquivo, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.selectedFile = file;
    await this.atualizarAppsCompativeis(file);

    if (file && file.isFile && this.showDetailsPane) {
      this.carregarPreviewArquivo(file);
    } else if (!file || file.isDirectory) {
      this.previewContent = undefined;
      this.previewFileDto = undefined;
    }
  }

  /**
   * Consulta os metadados de rotas (`data.manifest` e `data.files`) através do serviço `Apps`
   * para encontrar todos os aplicativos registrados que suportam o item selecionado.
   */
  async atualizarAppsCompativeis(file?: IArquivo) {
    const alvo = file || this.selectedFile;
    if (!alvo || !this.appsService) {
      this.compatibleApps = [];
      this.preferredApp = undefined;
      return;
    }

    const isDir = Boolean(alvo.isDirectory || alvo.info?.isDirectory);
    const matches = await this.appsService.findCompatibleApps({
      action: isDir ? 'explore' : 'open',
      fileFormat: isDir ? 'directory' : (alvo.extensao !== '-' ? alvo.extensao : ''),
      fileName: alvo.name,
      path: alvo.caminho || alvo.info?.path || undefined,
    });

    this.compatibleApps = matches;
    this.preferredApp = matches.find(m => m.isPreferred) || matches.find(m => !m.isFallback) || matches[0];
  }

  async abrir(file?: IArquivo, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    const alvo = file || this.selectedFile;
    if (!alvo) return;

    const caminhoAlvo = alvo.caminho || alvo.info?.path || this.resolverCaminhoFilho(this.endereco, undefined, alvo.name);
    if (!caminhoAlvo) return;

    this.selectedFile = alvo;
    await this.atualizarAppsCompativeis(alvo);

    if (alvo.isDirectory || alvo.info?.isDirectory) {
      await this.ir(caminhoAlvo);
      return;
    }

    // Se estiver dentro de um MatDialog (ex: seletor de arquivos), retorna o arquivo selecionado
    if (this.dialogRef) {
      this.dialogRef.close(alvo);
      return;
    }

    // Se o usuário já definiu um aplicativo preferido para este formato (ou há apenas 1 match específico),
    // abre pelo serviço de intenções de Apps; caso haja múltiplos candidatos sem preferência definida,
    // abre o painel lateral para que o usuário escolha seu aplicativo preferido.
    const explicitPreferred = this.compatibleApps.find(a => a.isPreferred);
    const specificMatches = this.compatibleApps.filter(a => !a.isFallback);

    if (explicitPreferred) {
      await this.abrirComAplicativo(explicitPreferred, alvo);
      return;
    }

    if (specificMatches.length === 1) {
      await this.abrirComAplicativo(specificMatches[0], alvo);
      return;
    }

    // Quando há múltiplos aplicativos compatíveis e nenhuma preferência salva, exibe o painel de escolha e preview
    this.showDetailsPane = true;
    await this.carregarPreviewArquivo(alvo);
  }

  async carregarPreviewArquivo(file: IArquivo) {
    const caminhoAlvo = file?.caminho || file?.info?.path;
    if (!caminhoAlvo || file.isDirectory) return;
    await this.carregarPreviewPorCaminho(caminhoAlvo);
  }

  private async carregarPreviewPorCaminho(filePath: string) {
    this.previewLoading = true;
    this.previewContent = undefined;
    try {
      const loaded = await lastValueFrom(
        this.fileExplorer.readFile({ body: { path: filePath } })
      );
      this.previewFileDto = loaded;
      this.previewContent = typeof loaded?.data === 'string'
        ? loaded.data
        : JSON.stringify(loaded?.data ?? '', null, 2);
    } catch (e: any) {
      console.trace(e);
      this.previewContent = `Não foi possível pré-visualizar o arquivo: ${e?.message || 'Formato binário ou acesso restrito.'}`;
    } finally {
      this.previewLoading = false;
    }
  }

  /**
   * Abre o arquivo/pasta utilizando um aplicativo descoberto dinamicamente via metadados de rota.
   */
  async abrirComAplicativo(app?: IAppInteractionMatch, file?: IArquivo, event?: Event) {
    if (event) event.stopPropagation();
    const alvo = file || this.selectedFile;
    const caminhoAlvo = alvo?.caminho || alvo?.info?.path;
    if (!alvo || !caminhoAlvo) return;

    if (this.dialogRef) {
      this.dialogRef.close(alvo);
      return;
    }

    if (!app) {
      await this.atualizarAppsCompativeis(alvo);
      app = this.preferredApp;
    }

    if (app && this.appsService) {
      await this.appsService.openWithApp(app, {
        action: alvo.isDirectory ? 'explore' : 'open',
        fileFormat: alvo.extensao,
        fileName: alvo.name,
        path: caminhoAlvo,
      });
    }
  }

  /**
   * Define (ou remove) o aplicativo preferido do usuário para o formato do arquivo selecionado.
   */
  async definirAppPreferido(app: IAppInteractionMatch, file?: IArquivo, event?: Event) {
    if (event) event.stopPropagation();
    const alvo = file || this.selectedFile;
    if (!alvo || !this.appsService) return;

    const formatKey = alvo.isDirectory ? 'directory' : (alvo.extensao && alvo.extensao !== '-' ? alvo.extensao : '*');
    const novaPref = app.isPreferred ? null : app.fullPath;
    this.appsService.setPreferredApp(formatKey, novaPref);
    await this.atualizarAppsCompativeis(alvo);
  }

  async copiarCaminho(file?: IArquivo, event?: Event) {
    if (event) event.stopPropagation();
    const caminho = file?.caminho || file?.info?.path || this.endereco;
    if (caminho && navigator?.clipboard) {
      await navigator.clipboard.writeText(caminho);
    }
  }

  alternarFavorito(caminho?: string, label?: string, event?: Event) {
    if (event) event.stopPropagation();
    const targetPath = this.normalizarCaminho(caminho || this.endereco);
    const idx = this.favoritos.findIndex(f => this.normalizarCaminho(f.path) === targetPath);
    if (idx >= 0) {
      this.favoritos.splice(idx, 1);
      this.favoritos = [...this.favoritos];
    } else {
      this.favoritos = [
        ...this.favoritos,
        {
          label: label || this.obterTituloPasta(targetPath),
          path: targetPath,
          icon: 'star',
          pinned: true,
        }
      ];
    }
    this.salvarPreferencias();
  }

  /** Expansão de subpastas na árvore lateral */
  toggleTreeFolder(folderPath?: string | null, event?: Event) {
    if (event) event.stopPropagation();
    if (!folderPath) return;
    if (this.expandedTreePaths.has(folderPath)) {
      this.expandedTreePaths.delete(folderPath);
    } else {
      this.expandedTreePaths.add(folderPath);
    }
  }

  isTreeExpanded(folderPath?: string | null): boolean {
    return !!folderPath && this.expandedTreePaths.has(folderPath);
  }

  getSubfolders(item?: IArquivo | ReadDirectoryOutput): ReadDirectoryOutput[] {
    const raw: any = (item as IArquivo)?.info || item;
    if (!raw || !Array.isArray(raw.children)) return [];
    return raw.children.filter((c: any) => c?.isDirectory);
  }

  /** Gerenciamento de Abas */
  novaAba(caminho?: string, event?: Event) {
    if (event) event.stopPropagation();
    const target = this.normalizarCaminho(caminho || this.endereco || './');
    const nova: IExplorerTab = {
      id: `tab-${Date.now()}`,
      title: this.obterTituloPasta(target),
      path: target,
    };
    this.tabs = [...this.tabs, nova];
    this.activeTabIndex = this.tabs.length - 1;
    this.ir(target);
  }

  selecionarAba(index: number) {
    if (index < 0 || index >= this.tabs.length) return;
    this.activeTabIndex = index;
    const tab = this.tabs[index];
    if (tab && tab.path !== this.endereco) {
      this.ir(tab.path);
    }
  }

  fecharAba(index: number, event?: Event) {
    if (event) event.stopPropagation();
    if (this.tabs.length <= 1) {
      this.ir('./');
      return;
    }
    this.tabs.splice(index, 1);
    this.tabs = [...this.tabs];
    if (this.activeTabIndex >= this.tabs.length) {
      this.activeTabIndex = this.tabs.length - 1;
    }
    const tabAtiva = this.tabs[this.activeTabIndex];
    if (tabAtiva) {
      this.ir(tabAtiva.path);
    }
  }

  /** Handlers de integração com @ci/components/data-grid */
  onGridSelect(evt?: SelectEvent<IArquivo>) {
    if (!evt?.value) {
      this.selecionar(undefined);
      return;
    }
    const item = evt.value;
    const now = Date.now();
    const mouseEvt = evt.event as MouseEvent | undefined;
    const isDoubleClick =
      (mouseEvt && typeof mouseEvt.detail === 'number' && mouseEvt.detail >= 2) ||
      (this.lastGridClickedItem === item && (now - this.lastGridClickTime) < 350);

    this.lastGridClickTime = now;
    this.lastGridClickedItem = item;

    if (item.isDirectory || isDoubleClick) {
      this.abrir(item);
    } else {
      this.selecionar(item);
    }
  }

  onGridSort(sortState: Record<string, 'ASC' | 'DESC'>) {
    if (!sortState) return;
    const keys = Object.keys(sortState);
    if (keys.length > 0) {
      const field = keys[keys.length - 1] as ArquivoSortField;
      const dir = sortState[field];
      if (field && dir) {
        this.sortBy = field;
        this.sortDirection = dir;
        this.atualizarListaExibida();
      }
    } else {
      this.sortBy = 'name';
      this.sortDirection = 'ASC';
      this.atualizarListaExibida();
    }
  }

  @HostListener('keydown', ['$event'])
  handleKeyboardNavigation(event: KeyboardEvent) {
    const targetTag = (event.target as HTMLElement)?.tagName?.toLowerCase();
    if (targetTag === 'input' || targetTag === 'textarea') return;

    if (event.altKey && event.key === 'ArrowLeft') {
      event.preventDefault();
      this.back();
    } else if (event.altKey && event.key === 'ArrowRight') {
      event.preventDefault();
      this.forward();
    } else if ((event.altKey && event.key === 'ArrowUp') || event.key === 'Backspace') {
      event.preventDefault();
      this.voltar();
    } else if (event.key === 'Enter' && this.selectedFile) {
      event.preventDefault();
      this.abrir(this.selectedFile);
    } else if (event.key === 'F5') {
      event.preventDefault();
      this.recarregar();
    }
  }
}

