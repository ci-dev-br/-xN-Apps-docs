import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, Inject, OnInit, Optional, Renderer2, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Router, RouterModule } from '@angular/router';
import { AuthModule, USER_MENU, UserAuthenticationService } from '@ci/auth';
import { FooterModule, NavbarModule } from '@ci/components';
import { CoreModule, TranslatePipe } from '@ci/core';
import { Application, NewsService, User } from '@ci/portal-api';
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SidebarSettings } from './sidebar-settings/sidebar-settings.components';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Publicar } from './publicar/publicar.component';
import { IItemMenu } from '@ci/components/window';
import { lastValueFrom } from 'rxjs';
const XD = <T>(a: T) => {
    (a as any).___styles_xd__internals = {
        m: { l: 0, r: 0, t: 0, b: 0 },
    };
    return a;
};
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
        MatInputModule,
        MatIconModule,
        MatCardModule,
        // TranslatePipe,
    ],
    templateUrl: './homepage.component.html',
    standalone: true,
    styleUrl: './homepage.component.scss'
})
export class HomepageComponent implements OnInit {
    pesquisa;
    stage?: 'loading' | 'loaded' = 'loading';
    feeds?: any[];/* [
        { author: 'John Doe', content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', date: new Date() },
        { author: 'Jane Smith', content: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', date: new Date() },
        { author: 'Bob Johnson', content: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.', date: new Date() },
        { author: 'Alice Williams', content: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.', date: new Date() }
    ]; */
    private _feedContainer?: ElementRef<HTMLDivElement
    > | undefined;
    public get feedContainer(): ElementRef<HTMLDivElement
    > | undefined {
        return this._feedContainer;
    }
    pos = 0;
    pagesize?: number;
    @ViewChild('feedContainer')
    public set feedContainer(value: ElementRef<HTMLDivElement
    > | undefined) {
        if (this._feedContainer === value) return;
        this._feedContainer = value;

        if (this._feedContainer?.nativeElement) {
            this._feedContainer.nativeElement.addEventListener('scrollend', (event) => {
                const chegouNoFim = this._feedContainer!.nativeElement.scrollTop + this._feedContainer!.nativeElement.clientHeight >= this._feedContainer!.nativeElement.scrollHeight - 2000;

                if (chegouNoFim && this.pagesize) {
                    this.carregarItens(this.pagesize + this.pos);
                }
            });
        }
    }
    constructor(
        @Optional() protected readonly userService?: UserAuthenticationService,
        @Optional() private render?: Renderer2,
        @Optional() private el?: ElementRef<Element>,
        @Optional() private readonly router?: Router,
        @Optional() private readonly dialog?: MatDialog,
        @Inject(USER_MENU) userMenu?: IItemMenu[],
        formBuilder?: FormBuilder,
        private readonly news?: NewsService,
    ) {
        this.pesquisa = formBuilder?.group({
            q: [],
        });
        this.carregarItens()
    }
    protected info?: any[];
    protected sidebar = false;
    protected categorias?: any[];
    protected apps?: Application[];
    protected bgs = [
        '/bg-apps-290847.jpg'
    ]
    loading?: boolean;
    async carregarItens(offset = 0) {
        if (this.loading) return;
        this.loading = true;
        this.news?.getFeed({
            offset: offset,
            dataInicial: (() => {
                const data_inicial = new Date();
                data_inicial.setDate(data_inicial.getDate() - 15);
                return data_inicial;
            })().toISOString(),
            dataFinal: new Date().toISOString()
        }).subscribe(feeds => {
            this.pos = offset; this.loading = false;
            if (this.pagesize === undefined) {
                this.pagesize = feeds.length;
            }
            const digest = feeds/* .map(feed => feed.posts).reduce((a: any, b: any) => [...(a || []), ...(b || [])]) */;
            this.feeds = [...(this.feeds || []), ...digest.filter(post => {
                try {
                    if (post.content.toLocaleLowerCase().indexOf('oferta') > -1) return false;
                    if (post.content.toLocaleLowerCase().indexOf('sex') > -1) return false;
                    if (post.content.toLocaleLowerCase().indexOf('bet') > -1) return false;
                    if (post.content.toLocaleLowerCase().indexOf(' odds') > -1) return false;
                    if (post.content.toLocaleLowerCase().indexOf('member') > -1) return false;
                    if (post.content.toLocaleLowerCase().indexOf('vip') > -1) return false;
                    if (post.content.toLocaleLowerCase().indexOf('cassino') > -1) return false;
                    if (post.content.toLocaleLowerCase().indexOf('unathorized') > -1) return false;
                    if (post.content.toLocaleLowerCase().indexOf('token') > -1) return false;
                } catch (error) {

                }
                return true;
            })];
        })
    }

    protected pesquisaControl = new FormControl();
    @ViewChild('video') protected video?: ElementRef<HTMLVideoElement>;
    async ngOnInit() {
        try {

            this.mountStyle();
            this.userService?.user.subscribe(user => this.updateUser(user));
            // Set the playback speed to 0.5 (half speed)
            if (this.video?.nativeElement) this.video.nativeElement.playbackRate = 0.1;
            if ('document' in this && !!document && !!document.body && !!window) {
                this.animacao();
            }
        } catch (error) {
            console.log(error);
        }
    }
    async animacao() {
        // TODO: animação entre 15 a 25 px na horizontal e vertical movendo lentamente de forma aleatória dentro desse limite 
        let limiteTop = 5;
        let limiteBottom = 35;
        let limiteLeft = 5;
        let limiteRight = 35;
        let directionY = 1;
        let directionX = 1;
        let posY = 0;
        let posX = 0;
        let velocidade = 0.15;
        let anima = () => {
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
            setTimeout(() => anima(), 900);
        }
        anima();
    }
    async pesquisar() {
        this.info = await lastValueFrom(this.news!.newsControllerPesquisar({
            textoConsulta: this.pesquisa?.value.q || undefined,
        }));
    }
    protected bg?: string;
    async mountStyle() {
        this.bg = this.bgs[Math.round((this.bgs.length - 1) * Math.random())];
    }
    @ViewChild('sidebarElement') protected sidebarEl?: ElementRef<HTMLElement>;
    private updateUser(user: User | undefined) {
        this.apps = [
            // TODO: revisar isto
            // XD({ name: 'Meus Apps', url: '/meus-apps' }),
        ]
        this.stage = 'loaded';
    }
    protected async appClickHandler(event: any, app: any) {
        if (event.ctrlKey) {
            window.open(location.href + '/' + app.url, '')
        } else {
            this.router?.navigate([app.url], {/*  relativeTo: this.route */ });
        }
    }
    protected openSidebarSettings() {
        this.dialog?.open(SidebarSettings, {
            data: {
                origin: this
            }
        });
    }
    sidebarTop = 25;
    sidebarLeft = 25;
    @HostListener('document:mousemove', ['$event'])
    protected isOutsideSidebar(event: MouseEvent) {
        let limit = 124;
        if (
            (this.sidebarEl && this.sidebarEl?.nativeElement.getBoundingClientRect().bottom + limit < event.clientY) ||
            (this.sidebarEl && this.sidebarEl?.nativeElement.getBoundingClientRect().top - limit > event.clientY) ||
            (this.sidebarEl && this.sidebarEl?.nativeElement.getBoundingClientRect().right + limit < event.clientX) ||
            (this.sidebarEl && this.sidebarEl?.nativeElement.getBoundingClientRect().left - limit > event.clientX)
        ) {
            this.sidebar = false;
        }
    }
    async newPost() {
        this.createNewPost('post');
    }
    async newCitation() {
        this.createNewPost('citation');
    }
    async newPhoto() {
        this.createNewPost('photo');
    }
    async newVideo() {
        this.createNewPost('video');
    }
    async createNewPost(tipo_postagem: 'post' | 'citation' | 'photo' | 'video') {
        this.dialog?.open(Publicar, {
            data: {
                tipo_postagem,
            }
        });
    }
    async interacao(origem: any, event: string) {
        if (event === 'open') {
            window.open(origem.url, '_blank', '');
        }
    }
}
