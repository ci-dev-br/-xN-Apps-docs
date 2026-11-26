import { Component, computed, Input, OnDestroy, OnInit, Optional, signal } from "@angular/core";
import { formatUserPhotoUrl, UserAuthenticationService } from "@ci/auth";
import { INavbarItemMenu } from "./i-menu-item";
import { IItemMenu } from "@ci/components/window";
import { MenuService } from "@ci/core";
import { User, InternalNotificationService, InternalNotification, NotificationDisplayMode } from "@ci/portal-api";
import { Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { NavbarContextAction, NavbarContextSelectOption, NavbarOrganizationAccessInfo, NavbarService } from "./navbar.service";
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
        this.navbarService?.syncAvailableApps(value);
    }
    user = signal<undefined | User>(this.userService.user.value);

    private readonly _menuItens = signal<INavbarItemMenu[] | undefined>(undefined);
    @Input()
    public get menuItens(): INavbarItemMenu[] | undefined {
        return this._menuItens();
    }
    public set menuItens(value: INavbarItemMenu[] | undefined) {
        this._menuItens.set(value);
    }

    private readonly _userMenuList = signal<IItemMenu[] | undefined>(undefined);
    @Input()
    public get userMenuList(): IItemMenu[] | undefined {
        return this._userMenuList();
    }
    public set userMenuList(value: IItemMenu[] | undefined) {
        this._userMenuList.set(value);
    }

    private readonly _endMenu = signal<(IItemMenu | INavbarItemMenu)[] | undefined>(undefined);
    @Input()
    public get endMenu(): (IItemMenu | INavbarItemMenu)[] | undefined {
        return this._endMenu();
    }
    public set endMenu(value: (IItemMenu | INavbarItemMenu)[] | undefined) {
        this._endMenu.set(value);
    }

    @Input() recentes?: any[];

    photoError = signal<boolean>(false);
    latestNotification = signal<InternalNotification | undefined>(undefined);
    private notifSub: any = null;

    resolvedStartMenuItems = computed<INavbarItemMenu[]>(() =>
        this.mergeMenuItems(this._menuItens(), this.navbarService?.resolvedStartMenu())
    );
    resolvedEndMenuItems = computed<INavbarItemMenu[]>(() =>
        this.mergeMenuItems(this._endMenu() as INavbarItemMenu[] | undefined, this.navbarService?.resolvedEndMenu())
    );
    resolvedUserMenuItems = computed<INavbarItemMenu[]>(() =>
        this.mergeMenuItems(this._userMenuList() as INavbarItemMenu[] | undefined, this.navbarService?.resolvedUserMenu())
    );

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

    constructor(
        private readonly userService: UserAuthenticationService,
        @Optional() menuService?: MenuService,
        @Optional() private readonly dialog?: MatDialog,
        @Optional() public readonly notificationService?: InternalNotificationService,
        @Optional() private readonly router?: Router,
        @Optional() public readonly navbarService?: NavbarService,
    ) {
        menuService?.userMenu?.subscribe(menu => {
            this.userMenuList = menu;
        });
    }




    isContextActionDisabled(action: NavbarContextAction): boolean {
        return typeof action.disabled === 'function' ? action.disabled() : !!action.disabled;
    }

    isContextActionActive(action: NavbarContextAction): boolean {
        return typeof action.active === 'function' ? action.active() : !!action.active;
    }

    getContextSelectValue(action: NavbarContextAction): any {
        return typeof action.value === 'function' ? action.value() : action.value;
    }

    getContextSelectOptions(action: NavbarContextAction): NavbarContextSelectOption[] {
        return typeof action.options === 'function' ? action.options() : (action.options || []);
    }

    get organizationAccess(): NavbarOrganizationAccessInfo | null {
        return this.navbarService?.organizationAccess() || null;
    }

    getOrganizationAccessTooltip(): string {
        const info = this.organizationAccess;
        if (!info) return 'Acesso à Organização';
        if (!info.organizationName) return 'Nenhuma organização selecionada — clique para gerenciar';
        const tipo = info.isOwner ? 'Criador' : 'Tenant compartilhado';
        const roles = info.roles?.length ? ` • Roles: ${info.roles.join(', ')}` : '';
        return `${info.organizationName} (${tipo}${roles})`;
    }

    selectOrganizationFromNavbar(orgId?: string | null, event?: Event): void {
        event?.stopPropagation();
        if (!orgId) return;
        this.navbarService?.selectActiveOrganization(orgId);
    }

    refreshOrganizationFromNavbar(event?: Event): void {
        event?.stopPropagation();
        this.navbarService?.refreshOrganizationAccess();
    }

    abrirOrganizacoes(): void {
        this.router?.navigate(['/Organizacao']);
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

    abrirAcaoNotificacao(notificacao: InternalNotification | any, event?: Event) {
        event?.stopPropagation();
        if (notificacao && !notificacao.read && this.notificationService) {
            this.marcarNotificacaoComoLida(notificacao);
        }
        if (notificacao?.actionUrl) {
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

    ngOnInit(): void {
        try {
            this.userService.user.subscribe(u => {
                this.photoError.set(false);
                this.user.set(u);
                if (!!this.apps) {
                    this.recentes = localStorage.getItem('NAV(RECENTES)')?.split(',').map(x => this.apps?.find(a => a?.name === x));
                    this.navbarService?.syncAvailableApps(this.apps);
                }
            });
            this.notifSub = this.notificationService?.notifications$?.subscribe((notifs: InternalNotification[]) => {
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
    }

    async sair() {
        this.userService?.sair();
    }

    isMenuItemVisible(item: INavbarItemMenu | IItemMenu | any): boolean {
        if (!item) return false;
        if (typeof item.visible === 'function') return Boolean(item.visible());
        return item.visible !== false;
    }

    isMenuItemDisabled(item: INavbarItemMenu | any): boolean {
        if (!item) return false;
        return typeof item.disabled === 'function' ? Boolean(item.disabled()) : Boolean(item.disabled);
    }

    getMenuItemTooltip(item: INavbarItemMenu | any): string {
        return item?.tooltip || item?.label || item?.title || '';
    }

    private mergeMenuItems(
        inputItems?: INavbarItemMenu[],
        serviceItems?: INavbarItemMenu[]
    ): INavbarItemMenu[] {
        const merged = [...(inputItems || []), ...(serviceItems || [])];
        const map = new Map<string, INavbarItemMenu>();
        for (const item of merged) {
            if (!item || !this.isMenuItemVisible(item)) continue;
            const key = item.id || `${typeof item.routerLink === 'string' ? item.routerLink : ''}::${item.label || ''}::${item.icon || ''}::${item.component ? item.component.name : ''}::${item.menuComponent ? item.menuComponent.name : ''}`;
            if (!map.has(key)) {
                map.set(key, item);
            }
        }
        return Array.from(map.values()).sort((a, b) => (a.order ?? 100) - (b.order ?? 100));
    }

    protected async itemMenuActionHandler(itemMenu: INavbarItemMenu | IItemMenu | any, event: Event) {
        if (!itemMenu || this.isMenuItemDisabled(itemMenu)) return;
        if (typeof itemMenu.onClick === 'function') {
            itemMenu.onClick(this, event);
        }
        if (itemMenu.dialogComponent) {
            event?.stopPropagation();
            this.dialog?.open(itemMenu.dialogComponent, {
                data: itemMenu.dialogData,
                width: '880px',
                maxWidth: '96vw',
                disableClose: false,
                ...(itemMenu.dialogConfig || {}),
            });
            return;
        }
        if (itemMenu.href && typeof window !== 'undefined') {
            window.open(itemMenu.href, itemMenu.target || '_blank');
            return;
        }
        if (itemMenu.routerLink && !itemMenu.children?.length && !itemMenu.menuComponent) {
            const commands = Array.isArray(itemMenu.routerLink)
                ? itemMenu.routerLink
                : [itemMenu.routerLink];
            await this.router?.navigate(commands, { queryParams: itemMenu.queryParams });
        }
    }

    async appClickHandler(event: MouseEvent, app: any) {
        if (event.ctrlKey && app?.url && typeof window !== 'undefined') {
            const cleanUrl = String(app.url).replace(/^\/+/, '');
            window.open(`/${cleanUrl}`, '_blank');
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