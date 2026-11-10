import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    Inject,
    NgZone,
    OnDestroy,
    OnInit,
    Optional,
    PendingTasks,
    PLATFORM_ID,
    Renderer2,
    signal,
    ViewChild,
    WritableSignal
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Router, RouterModule } from '@angular/router';
import { AuthModule, USER_MENU, UserAuthenticationService } from '@ci/auth';
import { FooterModule, NavbarModule } from '@ci/components';
import { CoreModule } from '@ci/core';
import { Application, NewsService, User } from '@ci/portal-api';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SidebarSettings } from './sidebar-settings/sidebar-settings.components';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Publicar } from './publicar/publicar.component';
import { IItemMenu } from '@ci/components/window';
import { finalize } from 'rxjs';
import { CI_STATIC_APPS } from '../painel/apps/apps';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ComentariosComponent } from './comentarios/comentarios';
import { FinancialTickerComponent } from './financial-ticker/financial-ticker.component';
import { MarketNewsTickerComponent } from './market-news-ticker/market-news-ticker.component';
import { MarketNewsFeedComponent } from './market-news-feed/market-news-feed.component';
import { UserBoardComponent } from './user-board/user-board.component';
import { ApplicationCatalogService } from '@ci/core';

const STOP_WORDS_SUBSTANTIVOS = new Set([
    'a', 'o', 'as', 'os', 'um', 'uma', 'uns', 'umas',
    'de', 'do', 'da', 'dos', 'das', 'dum', 'duma',
    'em', 'no', 'na', 'nos', 'nas', 'num', 'numa',
    'por', 'para', 'pelo', 'pela', 'pelos', 'pelas', 'pra', 'pro',
    'com', 'como', 'sem', 'sob', 'sobre', 'entre', 'contra', 'ate', 'até',
    'e', 'ou', 'mas', 'porem', 'porém', 'todavia', 'contudo', 'entretanto',
    'que', 'se', 'quando', 'onde', 'porque', 'por que', 'pois',
    'eu', 'tu', 'ele', 'ela', 'nos', 'nós', 'vos', 'vós', 'eles', 'elas',
    'você', 'voces', 'vocês', 'este', 'esta', 'estes', 'estas', 'isto',
    'esse', 'essa', 'esses', 'essas', 'isso', 'aquele', 'aquela', 'aqueles', 'aquelas', 'aquilo',
    'seu', 'sua', 'seus', 'suas', 'meu', 'minha', 'meus', 'minhas',
    'nosso', 'nossa', 'nossos', 'nossas',
    'segundo', 'conforme', 'apos', 'após', 'durante', 'mediante',
    'hoje', 'ontem', 'amanha', 'amanhã', 'agora', 'já', 'ja', 'ainda',
    'mais', 'menos', 'muito', 'pouco', 'bastante', 'tanto', 'quanto',
    'nao', 'não', 'sim', 'tambem', 'também', 'apenas', 'so', 'só',
    'novo', 'nova', 'novos', 'novas', 'grande', 'grandes', 'pequeno', 'pequena',
    'primeiro', 'primeira', 'ultimo', 'último', 'outros', 'outras', 'outro', 'outra',
    'fonte', 'origem', 'noticia', 'notícia', 'leia', 'veja', 'confira', 'saiba',
    'foto', 'video', 'vídeo', 'imagem', 'credito', 'crédito', 'reproducao', 'reprodução',
    'segunda', 'terça', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'sábado', 'domingo',
    'mercado', 'economia', 'governo', 'presidente', 'ministro', 'secretario', 'secretário',
    'empresa', 'empresas', 'pais', 'país', 'paises', 'países', 'cidade', 'estado', 'ano', 'mes', 'mês', 'dia'
]);

const TERMOS_BLOQUEADOS = [
    'oferta', 'sex', 'bet', ' odds', 'member', 'vip', 'cassino', 'unathorized', 'token'
];

@Component({
    selector: 'ci-homepage',
    imports: [
        CommonModule,
        RouterModule,
        CoreModule,
        AuthModule,
        NavbarModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        MatFormFieldModule,
        FooterModule,
        MatInputModule,
        ReactiveFormsModule,
        MatTabsModule,
        MatTooltipModule,
        MatSnackBarModule,
        ComentariosComponent,
        FinancialTickerComponent,
        MarketNewsTickerComponent,
        MarketNewsFeedComponent,
        UserBoardComponent,
        MatMenuModule,
        MatProgressSpinnerModule,
    ],
    templateUrl: './homepage.component.html',
    standalone: true,
    styleUrl: './homepage.component.scss'
})
export class HomepageComponent implements OnInit, OnDestroy {
    pesquisa;
    stage?: 'loading' | 'loaded' = 'loading';
    feeds: WritableSignal<Array<any>> = signal([]);
    highlightedFeed = signal<any | undefined>(undefined);
    showCommentsPane = signal<boolean>(true);
    isCommentsExpanded = signal<boolean>(false);
    selectedTabIndex = 0;
    pesquisaSubstantivoControl = new FormControl<string>('', { nonNullable: true });
    activeWikipediaSummary = signal<{
        termo: string;
        title: string;
        description?: string;
        extract?: string;
        thumbnail?: string;
        url?: string;
        loading?: boolean;
    } | null>(null);
    private nounsCache = new Map<string, string[]>();
    private linkedContentCache = new Map<string, string>();
    endMenu = signal([]);
    @ViewChild(MarketNewsFeedComponent) marketFeed?: MarketNewsFeedComponent;
    focarNoticiaMercado(item: any): void {
        this.selectedTabIndex = 1;
        this.cdr?.markForCheck();
        setTimeout(() => {
            if (this.marketFeed) {
                this.marketFeed.focarNoticia(item);
                this.marketFeed.showComments.set(true);
            }
        }, 120);
    }

    private _feedContainer?: ElementRef<HTMLDivElement>;
    public get feedContainer(): ElementRef<HTMLDivElement> | undefined {
        return this._feedContainer;
    }

    pos = 0;
    pagesize?: number;

    @ViewChild('feedContainer')
    public set feedContainer(value: ElementRef<HTMLDivElement> | undefined) {
        if (this._feedContainer === value) return;
        this._feedContainer = value;

        if (this._feedContainer?.nativeElement) {
            // Roda o listener de scroll fora da Zone e só entra na Zone quando realmente for carregar mais itens
            this.ngZone?.runOutsideAngular(() => {
                this._feedContainer!.nativeElement.addEventListener('scrollend', () => {
                    const el = this._feedContainer!.nativeElement;
                    const chegouNoFim = el.scrollTop + el.clientHeight >= el.scrollHeight - 2000;

                    if (chegouNoFim && this.pagesize && !this.loading) {
                        this.ngZone?.run(() => {
                            this.carregarItens(this.pagesize! + this.pos);
                        });
                    }
                });
            });
            this.setupScrollFocusDetection();
        }
    }

    protected info?: any[];
    protected sidebar = false;
    protected categorias?: any[];
    protected apps?: any[];
    protected bgs = ['/bg-apps-290847.jpg'];
    loading?: boolean;

    protected pesquisaControl = new FormControl();
    @ViewChild('video') protected video?: ElementRef<HTMLVideoElement>;
    protected bg?: string;
    @ViewChild('sidebarElement') protected sidebarEl?: ElementRef<HTMLElement>;

    sidebarTop = 25;
    sidebarLeft = 25;

    isLoggedIn = false;
    private removeMouseMoveListener?: () => void;
    private animacaoTimer?: any;

    constructor(
        @Optional() protected readonly userService?: UserAuthenticationService,
        @Optional() private render?: Renderer2,
        @Optional() private el?: ElementRef<Element>,
        @Optional() private readonly router?: Router,
        @Optional() private readonly dialog?: MatDialog,
        @Optional() private readonly snackBar?: MatSnackBar,
        @Optional() @Inject(USER_MENU) userMenu?: IItemMenu[],
        @Optional() formBuilder?: FormBuilder,
        @Optional() private readonly userAuthenticationInstanceService?: UserAuthenticationService,
        @Optional() private readonly news?: NewsService,
        private readonly pendingTasks?: PendingTasks,
        private readonly ngZone?: NgZone,
        private readonly cdr?: ChangeDetectorRef,
        @Inject(PLATFORM_ID) private readonly platformId?: Object,
        @Optional() private readonly catalogService?: ApplicationCatalogService
    ) {
        this.userService?.user.subscribe(user => {
            this.isLoggedIn = !!user && !!user.id;
            if (this.isLoggedIn) {
                this.catalogService?.refreshMyActivations().subscribe();
            }
            this.cdr?.markForCheck();
        });
        this.userAuthenticationInstanceService?.user.subscribe(user => {
            if (!!user) {
                this.apps = CI_STATIC_APPS.filter(app =>
                    !!app.roles?.find(role => !!user.roles?.find(r => r === role))
                );
                this.cdr?.markForCheck();
            }
        });
        let u = this.userAuthenticationInstanceService?.user.value
        if (!!u) {
            this.apps = CI_STATIC_APPS.filter(app =>
                !!app.roles?.find(role => !!u.roles?.find(r => r === role))
            );
            this.cdr?.markForCheck();
        }
        this.pesquisa = formBuilder?.group({
            q: [],
        });
        this.carregarItens();
    }
    carregarItens(offset = 0) {
        if (this.loading) return;
        if (!this.news) {
            this.stage = 'loaded';
            this.cdr?.detectChanges();
            return;
        }
        this.loading = true;
        const removePendingTask = offset === 0 ? this.pendingTasks?.add() : undefined;

        const data_inicial = new Date();
        data_inicial.setDate(data_inicial.getDate() - 15);
        data_inicial.setSeconds(0, 0);

        const data_final = new Date();
        data_final.setHours(23, 59, 59, 999);

        this.news.getFeed({
            offset: offset,
            dataInicial: data_inicial.toISOString(),
            dataFinal: data_final.toISOString()
        }).pipe(
            finalize(() => {
                this.loading = false;
                if (offset === 0) {
                    this.stage = 'loaded';
                    removePendingTask?.();
                }
                // Força o Angular a refletir imediatamente no template
                this.cdr?.detectChanges();
            })
        ).subscribe({
            next: (feeds) => {
                this.pos = offset;
                if (this.pagesize === undefined) {
                    this.pagesize = feeds.length;
                }

                const novosItens = feeds.filter(post => {
                    if (!post?.content) return true;
                    const content = String(post.content).toLowerCase();
                    return !TERMOS_BLOQUEADOS.some(termo => content.includes(termo));
                });

                this.feeds.set([...(this.feeds() || []), ...novosItens]);
                if (!this.highlightedFeed() && this.feeds().length > 0) {
                    this.highlightedFeed.set(this.feeds()[0]);
                }
                // Dispara a atualização imediata da view assim que o array é montado
                this.cdr?.detectChanges();
            },
            error: (err) => {
                console.error('Erro ao carregar o feed:', err);
            }
        });
    }

    async ngOnInit() {
        try {
            this.mountStyle();
            this.userService?.user.subscribe(user => this.updateUser(user));

            if (this.video?.nativeElement) {
                this.video.nativeElement.playbackRate = 0.1;
            }

            if (this.platformId && isPlatformBrowser(this.platformId)) {
                this.animacao();
                this.registrarMouseMoveOtimizado();
            }
        } catch (error) {
            console.log(error);
        }
    }

    ngOnDestroy() {
        this.removeMouseMoveListener?.();
        if (this.animacaoTimer) {
            clearTimeout(this.animacaoTimer);
        }
    }

    /**
     * Escuta o mousemove FORA da Zone do Angular.
     * Só aciona o ChangeDetectorRef se `this.sidebar` for realmente verdadeiro e precisar fechar.
     */
    private registrarMouseMoveOtimizado() {
        this.ngZone?.runOutsideAngular(() => {
            const handler = (event: MouseEvent) => {
                if (!this.sidebar || !this.sidebarEl?.nativeElement) return;

                const rect = this.sidebarEl.nativeElement.getBoundingClientRect();
                const limit = 124;

                if (
                    rect.bottom + limit < event.clientY ||
                    rect.top - limit > event.clientY ||
                    rect.right + limit < event.clientX ||
                    rect.left - limit > event.clientX
                ) {
                    this.ngZone?.run(() => {
                        this.sidebar = false;
                        this.cdr?.markForCheck();
                    });
                }
            };

            document.addEventListener('mousemove', handler, { passive: true });
            this.removeMouseMoveListener = () => document.removeEventListener('mousemove', handler);
        });
    }

    async animacao() {
        let limiteTop = 5;
        let limiteBottom = 35;
        let limiteLeft = 5;
        let limiteRight = 35;
        let directionY = 1;
        let directionX = 1;
        let posY = 0;
        let posX = 0;

        this.ngZone?.runOutsideAngular(() => {
            const anima = () => {
                if (posY >= limiteBottom) directionY = -1;
                if (posY <= limiteTop) directionY = 1;
                if (posX >= limiteRight) directionX = -1;
                if (posX <= limiteLeft) directionX = 1;
                posY += directionY * 4 * Math.random();
                posX += directionX * 4 * Math.random();

                if (this.sidebarEl?.nativeElement.classList.contains('--inactive')) {
                    this.sidebarTop = (45 * Math.random()) + posY;
                    this.sidebarLeft = (45 * Math.random()) + posX;
                } else {
                    this.sidebarTop = 5;
                    this.sidebarLeft = 5;
                }
                this.animacaoTimer = setTimeout(() => anima(), 900);
            };
            anima();
        });
    }

    async mountStyle() {
        this.bg = this.bgs[Math.round((this.bgs.length - 1) * Math.random())];
    }

    private updateUser(user: User | undefined) {
        this.apps = [];
        this.cdr?.markForCheck();
    }

    // Função de trackBy para usar no HTML e evitar recriação de elementos no DOM
    trackByFeed(index: number, item: any): any {
        return item?.id || item?.url || index;
    }

    protected async appClickHandler(event: any, app: any) {
        if (event.ctrlKey) {
            window.open(location.href + '/' + app.url, '');
        } else {
            this.router?.navigate([app.url], {});
        }
    }

    protected openSidebarSettings() {
        this.dialog?.open(SidebarSettings, {
            data: { origin: this }
        });
    }

    async newPost() { this.createNewPost('post'); }
    async newCitation() { this.createNewPost('citation'); }
    async newPhoto() { this.createNewPost('photo'); }
    async newVideo() { this.createNewPost('video'); }

    async createNewPost(tipo_postagem: 'post' | 'citation' | 'photo' | 'video') {
        this.dialog?.open(Publicar, {
            data: { tipo_postagem }
        });
    }
    async interacao(origem: any, event: string) {
        if (event === 'open') {
            window.open(origem.url, '_blank', '');
        }
    }

    /**
     * Registra ou altera o voto (UP ou DOWN) na notícia para o usuário logado.
     */
    votar(feed: any, vote: 'UP' | 'DOWN', event?: Event) {
        if (event) {
            event.stopPropagation();
        }

        if (!this.isLoggedIn) {
            this.snackBar?.open('Faça login para votar nas notícias.', 'Entrar', { duration: 4000 })
                .onAction().subscribe(() => {
                    this.router?.navigate(['/acessar']);
                });
            return;
        }

        if (!this.news) return;

        const newsId = feed.id || feed.url;
        /* this.news.vote(newsId, vote).subscribe({
            next: (stats) => {
                feed.upVotes = stats.upVotes;
                feed.downVotes = stats.downVotes;
                feed.userVote = stats.userVote;
                this.cdr?.markForCheck();
            },
            error: (err) => {
                console.error('Erro ao registrar voto na notícia:', err);
                this.snackBar?.open('Não foi possível registrar seu voto.', 'Fechar', { duration: 3000 });
            }
        }); */
    }

    /**
     * Foca a notícia manualmente ao clicar nela.
     */
    focarNoticia(feed: any) {
        if (this.highlightedFeed() !== feed) {
            this.highlightedFeed.set(feed);
            this.cdr?.markForCheck();
        }
    }

    /**
     * Abre os comentários e foca a notícia selecionada.
     */
    focarComentarios(feed: any, event?: Event) {
        if (event) {
            event.stopPropagation();
        }
        this.highlightedFeed.set(feed);
        this.showCommentsPane.set(true);
        this.cdr?.markForCheck();
    }

    /**
     * Alterna a visibilidade do painel contextual de comentários.
     */
    toggleCommentsPane() {
        this.showCommentsPane.update(v => !v);
        this.cdr?.markForCheck();
    }

    /**
     * Alterna o modo expandido (tela ampla/cheia) do painel de comentários.
     */
    toggleExpandComments() {
        this.isCommentsExpanded.update(v => !v);
        this.cdr?.markForCheck();
    }

    /**
     * Monitora a rolagem para detectar qual notícia está no terço superior (foco de leitura)
     * e atualizar dinamicamente o painel de comentários sem recriar DOM desnecessário.
     */
    private setupScrollFocusDetection() {
        if (!this._feedContainer?.nativeElement) return;
        const el = this._feedContainer.nativeElement;

        let ticking = false;
        this.ngZone?.runOutsideAngular(() => {
            el.addEventListener('scroll', () => {
                if (!ticking) {
                    window.requestAnimationFrame(() => {
                        this.detectHighlightedFeed(el);
                        ticking = false;
                    });
                    ticking = true;
                }
            }, { passive: true });
        });
    }

    private detectHighlightedFeed(container: HTMLElement) {
        const items = container.querySelectorAll('.feed-item');
        if (!items || items.length === 0) return;

        const containerRect = container.getBoundingClientRect();
        const focalPointY = containerRect.top + containerRect.height * 0.35;

        let closestFeed: any = null;
        let minDistance = Infinity;

        const currentFeeds = this.feeds();

        items.forEach((itemEl, index) => {
            const rect = itemEl.getBoundingClientRect();
            const itemCenter = rect.top + rect.height / 2;
            const distance = Math.abs(itemCenter - focalPointY);

            if (distance < minDistance) {
                minDistance = distance;
                closestFeed = currentFeeds[index];
            }
        });

        if (closestFeed && this.highlightedFeed() !== closestFeed) {
            this.ngZone?.run(() => {
                this.highlightedFeed.set(closestFeed);
                this.cdr?.markForCheck();
            });
        }
    }

    /**
     * Alterna a exibição da caixa de comentários da notícia (legado).
     */
    alternarComentarios(feed: any) {
        this.focarComentarios(feed);
    }

    /**
     * Extrai substantivos próprios (nomes de entidades, empresas, pessoas, siglas e termos próprios)
     * a partir do título e conteúdo de uma notícia.
     */
    obterSubstantivosProprios(item: any): string[] {
        if (!item) return [];
        const cacheKey = item.id || item.url || item.title;
        if (cacheKey && this.nounsCache.has(cacheKey)) {
            return this.nounsCache.get(cacheKey)!;
        }

        const rawText = `${item.title || ''} ${item.content || ''}`;
        if (!rawText.trim()) return [];

        // Remove tags HTML e entidades especiais
        const cleanText = rawText
            .replace(/<[^>]*>/g, ' ')
            .replace(/&[a-z0-9#]+;/gi, ' ')
            .replace(/\s+/g, ' ');

        // Captura expressões compostas capitalizadas ou siglas maiúsculas
        const regex = /\b([A-ZÀ-Ú][a-zà-ú]+(?:\s+(?:de|do|da|dos|das|e)\s+[A-ZÀ-Ú][a-zà-ú]+|\s+[A-ZÀ-Ú][a-zà-ú]+)*|[A-Z]{2,6})\b/g;
        const matches = cleanText.match(regex) || [];

        const seen = new Set<string>();
        const substantivos: string[] = [];

        for (const m of matches) {
            const trimmed = m.trim();
            const lower = trimmed.toLowerCase();
            if (trimmed.length < 3) continue;
            if (STOP_WORDS_SUBSTANTIVOS.has(lower)) continue;
            if (seen.has(lower)) continue;

            seen.add(lower);
            substantivos.push(trimmed);
            if (substantivos.length >= 6) break;
        }

        if (cacheKey) {
            this.nounsCache.set(cacheKey, substantivos);
        }
        return substantivos;
    }

    /**
     * Pesquisa direta pelo input manual de substantivo próprio.
     */
    pesquisarSubstantivoManual() {
        const termo = this.pesquisaSubstantivoControl.value?.trim();
        if (termo) {
            this.pesquisarWikipedia(termo);
        }
    }

    /**
     * Seleciona um substantivo próprio para focar e preencher na barra de busca.
     */
    selecionarSubstantivoParaPesquisa(termo?: string | null) {
        if (!termo) return;
        this.pesquisaSubstantivoControl.setValue(termo);
        this.pesquisarWikipedia(termo);
    }

    /**
     * Pesquisa o substantivo próprio no Google (via URL permitida de busca oficial).
     */
    pesquisarGoogle(termo?: string | null, event?: Event) {
        if (event) event.stopPropagation();
        const query = termo || this.pesquisaSubstantivoControl.value?.trim();
        if (!query) return;
        const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        if (this.platformId && isPlatformBrowser(this.platformId)) {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    }

    /**
     * Pesquisa o substantivo próprio no Google Notícias.
     */
    pesquisarGoogleNoticias(termo?: string | null, event?: Event) {
        if (event) event.stopPropagation();
        const query = termo || this.pesquisaSubstantivoControl.value?.trim();
        if (!query) return;
        const url = `https://news.google.com/search?q=${encodeURIComponent(query)}`;
        if (this.platformId && isPlatformBrowser(this.platformId)) {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    }

    /**
     * Pesquisa o substantivo próprio no TikTok (via URL permitida de busca de tendências/vídeos).
     */
    pesquisarTikTok(termo?: string | null, event?: Event) {
        if (event) event.stopPropagation();
        const query = termo || this.pesquisaSubstantivoControl.value?.trim();
        if (!query) return;
        const url = `https://www.tiktok.com/search?q=${encodeURIComponent(query)}`;
        if (this.platformId && isPlatformBrowser(this.platformId)) {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    }

    /**
     * Pesquisa o substantivo próprio na Wikipedia através da API pública e permitida do MediaWiki / REST.
     * Traz resumo introdutório, imagem oficial e link de leitura para exibição instantânea na interface.
     */
    async pesquisarWikipedia(termo?: string | null, event?: Event) {
        if (event) event.stopPropagation();
        const query = termo || this.pesquisaSubstantivoControl.value?.trim();
        if (!query) return;

        this.activeWikipediaSummary.set({
            termo: query,
            title: query,
            loading: true
        });
        this.cdr?.markForCheck();

        if (this.platformId && !isPlatformBrowser(this.platformId)) {
            return;
        }

        try {
            // 1. Tenta resumo direto pela API REST da Wikipedia
            const summaryUrl = `https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
            const res = await fetch(summaryUrl, {
                headers: { 'Accept': 'application/json' }
            });

            if (res.ok) {
                const data = await res.json();
                if (data.extract) {
                    this.activeWikipediaSummary.set({
                        termo: query,
                        title: data.title || query,
                        description: data.description,
                        extract: data.extract,
                        thumbnail: data.thumbnail?.source,
                        url: data.content_urls?.desktop?.page || `https://pt.wikipedia.org/wiki/${encodeURIComponent(data.title || query)}`,
                        loading: false
                    });
                    this.cdr?.markForCheck();
                    return;
                }
            }

            // 2. Fallback: Consulta a API de pesquisa (Action API) para resolver desambiguações ou termos parciais
            const searchApiUrl = `https://pt.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json&origin=*`;
            const searchRes = await fetch(searchApiUrl);
            if (searchRes.ok) {
                const searchData = await searchRes.json();
                const firstResult = searchData.query?.search?.[0];
                if (firstResult && firstResult.title) {
                    const fallbackSummaryRes = await fetch(`https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(firstResult.title)}`);
                    if (fallbackSummaryRes.ok) {
                        const fbData = await fallbackSummaryRes.json();
                        this.activeWikipediaSummary.set({
                            termo: query,
                            title: fbData.title || firstResult.title,
                            description: fbData.description,
                            extract: fbData.extract || firstResult.snippet?.replace(/<[^>]*>/g, ''),
                            thumbnail: fbData.thumbnail?.source,
                            url: fbData.content_urls?.desktop?.page || `https://pt.wikipedia.org/wiki/${encodeURIComponent(firstResult.title)}`,
                            loading: false
                        });
                        this.cdr?.markForCheck();
                        return;
                    }
                }
            }

            // 3. Fallback genérico para a busca da Wikipedia
            this.activeWikipediaSummary.set({
                termo: query,
                title: query,
                description: 'Pesquisa enciclopédica na Wikipedia',
                extract: `Explore a enciclopédia livre para saber mais sobre "${query}". Clique no botão abaixo para abrir a página de pesquisa correspondente na Wikipedia.`,
                url: `https://pt.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`,
                loading: false
            });
            this.cdr?.markForCheck();
        } catch (error) {
            console.warn('Erro ao consultar a API da Wikipedia:', error);
            this.activeWikipediaSummary.set({
                termo: query,
                title: query,
                description: 'Wikipedia',
                extract: `Não foi possível carregar o resumo instantâneo. Clique no botão abaixo para abrir a pesquisa diretamente na Wikipedia.`,
                url: `https://pt.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`,
                loading: false
            });
            this.cdr?.markForCheck();
        }
    }

    /**
     * Fecha o card/resumo da Wikipedia na interface.
     */
    fecharResumoWikipedia() {
        this.activeWikipediaSummary.set(null);
        this.cdr?.markForCheck();
    }

    /**
     * Renderiza o corpo da notícia integrando links interativos nos substantivos próprios
     * e termos-chave detectados, permitindo navegar entre conteúdos co-relacionados.
     */
    obterConteudoComLinks(news: any): string {
        if (!news) return '';
        const rawContent = news.content || '';
        if (!rawContent.trim()) return '';

        const cacheKey = news.id || news.url || news.title;
        if (cacheKey && this.linkedContentCache.has(cacheKey)) {
            return this.linkedContentCache.get(cacheKey)!;
        }

        const terms = this.obterSubstantivosProprios(news).filter(t => t && t.length >= 3);
        if (terms.length === 0) {
            return rawContent;
        }

        // Ordena por comprimento decrescente para termos compostos maiores terem precedência
        const sortedTerms = [...terms].sort((a, b) => b.length - a.length);
        const escaped = sortedTerms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
        const pattern = new RegExp(`\\b(${escaped})\\b`, 'gi');

        // Divide o HTML de forma segura entre tags <...> e nós de texto puro
        const parts = rawContent.split(/(<[^>]*>)/g);
        for (let i = 0; i < parts.length; i += 2) {
            if (parts[i]) {
                parts[i] = parts[i].replace(pattern, (match: string) => {
                    return `<a class="entity-inline-link" data-term="${encodeURIComponent(match)}" href="javascript:void(0)" title="Explorar '${match}' e notícias correlacionadas">${match}</a>`;
                });
            }
        }

        const linkedHtml = parts.join('');
        if (cacheKey) {
            this.linkedContentCache.set(cacheKey, linkedHtml);
        }
        return linkedHtml;
    }

    /**
     * Identifica notícias correlacionadas no feed a partir de substantivos próprios e categoria.
     */
    obterNoticiasCorrelacionadas(news: any): any[] {
        if (!news || !this.feeds() || this.feeds().length <= 1) return [];
        const terms = this.obterSubstantivosProprios(news).map(t => t.toLowerCase());
        const currentId = news.id || news.url || news.title;

        const results: { feed: any; score: number }[] = [];

        for (const feed of this.feeds()) {
            const feedId = feed.id || feed.url || feed.title;
            if (feedId === currentId) continue;

            let score = 0;
            const feedText = `${feed.title || ''} ${feed.content || ''}`.toLowerCase();

            for (const term of terms) {
                if (feedText.includes(term)) {
                    score += 2;
                }
            }

            if (news.categoria && feed.categoria && news.categoria.toLowerCase() === feed.categoria.toLowerCase()) {
                score += 1;
            }

            if (score > 0) {
                results.push({ feed, score });
            }
        }

        results.sort((a, b) => b.score - a.score);
        return results.slice(0, 4).map(r => r.feed);
    }

    /**
     * Trata o clique nos links de substantivos próprios e termos integrados no corpo do texto.
     */
    onConteudoClick(event: MouseEvent) {
        const target = (event.target as HTMLElement)?.closest('.entity-inline-link') as HTMLElement;
        if (!target) return;
        event.preventDefault();
        event.stopPropagation();

        const rawTerm = target.getAttribute('data-term');
        const termo = rawTerm ? decodeURIComponent(rawTerm) : target.innerText?.trim();
        if (!termo) return;

        // 1. Atualiza a barra de pesquisa
        this.pesquisaSubstantivoControl.setValue(termo);

        // 2. Consulta a API da Wikipedia
        this.pesquisarWikipedia(termo);

        // 3. Localiza notícia correlacionada no feed
        const correl = this.feeds().find(f =>
            f !== this.highlightedFeed() &&
            ((f.title && f.title.toLowerCase().includes(termo.toLowerCase())) ||
             (f.content && String(f.content).toLowerCase().includes(termo.toLowerCase())))
        );

        if (correl) {
            this.snackBar?.open(`Notícia correlacionada: "${correl.title?.substring(0, 42)}..."`, 'Visualizar', { duration: 5000 })
                .onAction().subscribe(() => {
                    this.focarNoticia(correl);
                });
        }
    }

    async AtivarAlerta() {
        // TODO: implementar ativar alerta.
    }
}