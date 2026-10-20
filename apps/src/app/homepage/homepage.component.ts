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
import { ComentariosComponent } from './comentarios/comentarios';
import { FinancialTickerComponent } from './financial-ticker/financial-ticker.component';
import { UserBoardComponent } from './user-board/user-board.component';
import { ApplicationCatalogService } from '@ci/core';

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
        UserBoardComponent,
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
    protected apps?: Application[];
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
        this.news.vote(newsId, vote).subscribe({
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
        });
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

    async AtivarAlerta() {
        // TODO: implementar ativar alerta.
    }
}