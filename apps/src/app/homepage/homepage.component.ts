import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, Optional, Renderer2, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Router, RouterModule } from '@angular/router';
import { AuthModule, UserAuthenticationService } from '@ci/auth';
import { FooterModule, NavbarModule } from '@ci/components';
import { CoreModule } from '@ci/core';
import { Application, User } from '@ci/portal-api';
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SidebarSettings } from './sidebar-settings/sidebar-settings.components';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormControl } from '@angular/forms';
import { Publicar } from './publicar/publicar.component';
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
    ],
    templateUrl: './homepage.component.html',
    standalone: true,
    styleUrl: './homepage.component.scss'
})
export class HomepageComponent implements OnInit {
    stage?: 'loading' | 'loaded' = 'loading';
    constructor(
        @Optional() protected readonly userService?: UserAuthenticationService,
        @Optional() private render?: Renderer2,
        @Optional() private el?: ElementRef<Element>,
        @Optional() private readonly router?: Router,
        @Optional() private readonly dialog?: MatDialog,
    ) {
    }
    protected sidebar = false;
    protected categorias?: any[];
    protected apps?: Application[];
    protected bgs = [
        '/bg-apps-290847.jpg'
    ]
    protected pesquisaControl = new FormControl();
    @ViewChild('video') protected video?: ElementRef<HTMLVideoElement>;
    async ngOnInit() {
        this.mountStyle();
        this.userService?.user.subscribe(user => this.updateUser(user));
        // Set the playback speed to 0.5 (half speed)
        if (this.video?.nativeElement) this.video.nativeElement.playbackRate = 0.1;
        if ('document' in this && !!document && !!document.body && !!window) {
            this.animacao();
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
}
