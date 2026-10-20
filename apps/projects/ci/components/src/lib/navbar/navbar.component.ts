import { Component, Input, OnDestroy, OnInit, Optional, signal } from "@angular/core";
import { formatUserPhotoUrl, UserAuthenticationService } from "@ci/auth";
import { INavbarItemMenu } from "./i-menu-item";
import { IItemMenu } from "@ci/components/window";
import { MenuService } from "@ci/core";
import { AvailableVersionInfoDto, DeployerService, User, InternalNotificationService, InternalNotification, NotificationDisplayMode } from "@ci/portal-api";
import { lastValueFrom } from "rxjs";
import { Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { GruposModalComponent } from "../grupos-modal/grupos-modal.component";

@Component({
    selector: 'ci-navbar',
    standalone: false,
    templateUrl: 'navbar.component.html',
    styleUrls: [
        `navbar.component.scss`,
    ]
})
export class NavbarComponent implements OnInit, OnDestroy {
    _apps = signal<undefined | any[]>(undefined);
    public get apps() {
        return this._apps();
    }
    @Input()
    public set apps(value: undefined | any[]) {
        if (this._apps() === value) return;
        this._apps.set(value);
    }
    user = signal<undefined | User>(this.userService.user.value);
    @Input() menuItens?: INavbarItemMenu[];
    @Input() userMenuList?: IItemMenu[];
    @Input() recentes?: any[];

    versionInfo = signal<AvailableVersionInfoDto | undefined>(undefined);
    loadingVersion = signal<boolean>(false);
    publishing = signal<boolean>(false);
    lastActionMessage = signal<string | undefined>(undefined);
    photoError = signal<boolean>(false);
    latestNotification = signal<InternalNotification | undefined>(undefined);
    private notifSub: any = null;
    private pollTimer: any = null;

    /**
     * Retorna a URL tratada da foto do usuário para exibição na navbar
     */
    get userPhotoUrl(): string | undefined {
        if (this.photoError()) return undefined;
        return this.extractPhotoUrl(this.user()?.photo);
    }

    onPhotoError(): void {
        this.photoError.set(true);
    }

    private extractPhotoUrl(photo: any): string | undefined {
        return formatUserPhotoUrl(photo) || undefined;
    }

    /**
     * Visível exclusivamente para usuários que possuem a ROLE 'DEVELOPER'
     */
    get isDeveloper(): boolean {
        const roles = this.user()?.roles;
        return Array.isArray(roles) && roles.includes('DEVELOPER');
    }

    constructor(
        private readonly userService: UserAuthenticationService,
        @Optional() menuService?: MenuService,
        @Optional() private readonly deployerService?: DeployerService,
        @Optional() private readonly dialog?: MatDialog,
        @Optional() public readonly notificationService?: InternalNotificationService,
        @Optional() private readonly router?: Router,
    ) {
        menuService?.userMenu?.subscribe(menu => {
            this.userMenuList = menu;
        });
    }

    get displayMode$() {
        return this.notificationService?.displayMode$;
    }

    get displayMode(): NotificationDisplayMode {
        return this.notificationService?.displayMode || 'menu';
    }

    setDisplayMode(mode: NotificationDisplayMode) {
        this.notificationService?.setDisplayMode(mode);
    }

    get isSidebarOpen$() {
        return this.notificationService?.isSidebarOpen$;
    }

    toggleSidebar(open?: boolean) {
        this.notificationService?.toggleSidebar(open);
    }

    get isStatusbarExpanded$() {
        return this.notificationService?.isStatusbarExpanded$;
    }

    toggleStatusbar(open?: boolean) {
        this.notificationService?.toggleStatusbar(open);
    }

    get unreadCount$() {
        return this.notificationService?.unreadCount$;
    }

    get notifications$() {
        return this.notificationService?.notifications$;
    }

    get pushStatus$() {
        return this.notificationService?.pushPermissionStatus;
    }

    async solicitarPermissaoPush(event?: Event) {
        event?.stopPropagation();
        await this.notificationService?.solicitarPermissaoPush();
    }

    marcarNotificacaoComoLida(notificacao: InternalNotification, event?: Event) {
        event?.stopPropagation();
        this.notificationService?.marcarComoLida(notificacao).subscribe();
    }

    marcarTodasNotificacoesComoLidas(event?: Event) {
        event?.stopPropagation();
        this.notificationService?.marcarTodasComoLidas().subscribe();
    }

    testarNotificacao(event?: Event) {
        event?.stopPropagation();
        this.notificationService?.enviarNotificacaoTeste().subscribe({
            next: () => {
                this.notificationService?.carregarNotificacoes();
            }
        });
    }

    abrirAcaoNotificacao(notificacao: InternalNotification, event?: Event) {
        event?.stopPropagation();
        this.marcarNotificacaoComoLida(notificacao);
        if (notificacao.actionUrl) {
            if (notificacao.actionUrl.startsWith('http')) {
                window.open(notificacao.actionUrl, '_blank');
            } else {
                this.router?.navigateByUrl(notificacao.actionUrl);
            }
        }
    }

    getNotificationIcon(type?: string): string {
        switch (type) {
            case 'MENSAGEM': return 'chat';
            case 'GRUPO': return 'groups';
            case 'SISTEMA': return 'terminal';
            case 'AVISO': return 'warning';
            default: return 'notifications';
        }
    }

    /**
     * Abre a modal de Grupos e Comunidades na aba solicitada (0: Encontrar, 1: Criar, 2: Meus Grupos).
     */
    abrirGrupos(initialTab: number = 0) {
        this.dialog?.open(GruposModalComponent, {
            data: { initialTab },
            width: '880px',
            maxWidth: '96vw',
            panelClass: 'ci-grupos-dialog-panel',
            disableClose: false,
        });
    }

    ngOnInit(): void {
        try {
            this.userService.user.subscribe(u => {
                this.photoError.set(false);
                this.user.set(u);
                if (!!this.apps)
                    this.recentes = localStorage.getItem('NAV(RECENTES)')?.split(',').map(x => this.apps?.find(a => a?.name === x));
            });
            this.notifSub = this.notificationService?.notifications$.subscribe(notifs => {
                this.latestNotification.set(notifs && notifs.length > 0 ? notifs[0] : undefined);
            });
        } catch (error) {
            console.trace(error);
        }
    }

    ngOnDestroy(): void {
        if (this.notifSub) {
            this.notifSub.unsubscribe();
            this.notifSub = null;
        }
        if (this.pollTimer) {
            clearTimeout(this.pollTimer);
            this.pollTimer = null;
        }
    }

    async carregarVersaoDisponivel(event?: Event) {
        if (event) {
            event.stopPropagation();
        }
        if (!this.isDeveloper || !this.deployerService) return;

        this.loadingVersion.set(true);
        try {
            const info = await lastValueFrom(this.deployerService.getVersion());
            this.versionInfo.set(info);

            if (this.pollTimer) {
                clearTimeout(this.pollTimer);
                this.pollTimer = null;
            }
            if (info?.publishStatus === 'running') {
                this.pollTimer = setTimeout(() => this.carregarVersaoDisponivel(), 2500);
            }
        } catch (error) {
            console.trace(error);
        } finally {
            this.loadingVersion.set(false);
        }
    }

    async publicarVersao(
        action: 'gulp' | 'server-build' | 'full-publish' | 'sync-git' = 'gulp',
        event?: Event
    ) {
        if (event) {
            event.stopPropagation();
        }
        if (!this.isDeveloper || !this.deployerService) return;

        this.publishing.set(true);
        try {
            const res = await lastValueFrom(
                this.deployerService.publish({ body: { action } })
            );
            this.lastActionMessage.set(res?.mensagem || 'Ação de publicação enviada.');
            await this.carregarVersaoDisponivel();
        } catch (error: any) {
            console.trace(error);
            this.lastActionMessage.set(error?.error?.message || error?.message || 'Erro ao acionar publicação.');
        } finally {
            this.publishing.set(false);
        }
    }

    async sair() {
        this.userService?.sair();
    }
    protected async itemMenuActionHandler(itemMenu: IItemMenu, event: Event) {
        if (itemMenu.onClick) itemMenu.onClick(this, event);
    }
    async appClickHandler(event: MouseEvent, app: any) {
        if (event.ctrlKey) {
            // window.open(location.href + '/' + app.url, '')
        } else {
            // this.router./*  */navigate(['/' + app.url], { relativeTo: this.route.root })
        }
        setTimeout(() => document.body.click(), 300);
        if (app.__cta_hndlred === undefined) app.__cta_hndlred = 0;
        app.__cta_hndlred++;
        if (!this.recentes) this.recentes = [];
        const app_recente_corrente_position = this.recentes.indexOf(app);
        if (app_recente_corrente_position > -1) {
            this.recentes.splice(app_recente_corrente_position, 1);
        }
        this.recentes.reverse();
        this.recentes.push(app);
        this.recentes.reverse();
        if (this.recentes.length > 4) this.recentes.length = 4;
        this.recentes = [...this.recentes];
        localStorage.setItem('NAV(RECENTES)', this.recentes.map((e: any) => String(e?.name)).join(','))
    }
}