import { computed, Injectable, OnDestroy, Optional, signal } from "@angular/core";
import { NavigationEnd, Route, Router } from "@angular/router";
import { UserAuthenticationService } from "@ci/auth";
import { ApplicationCatalogService, Apps, RouteMetadata } from "@ci/core";
import { OrganizacaoResumoDto, OrganizacaoService, User } from "@ci/portal-api";
import { filter, lastValueFrom, Subscription } from "rxjs";
import { INavbarItemMenu, NavbarMenuSlot } from "./i-menu-item";

export interface NavbarContextSelectOption {
    label: string;
    value: any;
}

export interface NavbarContextAction {
    id: string;
    label: string;
    icon?: string;
    tooltip?: string;
    variant?: 'basic' | 'stroked' | 'flat' | 'raised' | 'select';
    color?: 'primary' | 'accent' | 'warn';
    disabled?: boolean | (() => boolean);
    active?: boolean | (() => boolean);
    onClick?: (event: Event) => void;
    value?: any | (() => any);
    options?: NavbarContextSelectOption[] | (() => NavbarContextSelectOption[]);
    onChange?: (value: any) => void;
}

export interface NavbarOrganizationAccessInfo {
    active: boolean;
    organizationId?: string;
    organizationName?: string;
    tenantId?: string;
    tenantName?: string;
    isOwner?: boolean;
    roles: string[];
    organizations: OrganizacaoResumoDto[];
    loading?: boolean;
}

export interface NavbarRouteResourceConfig extends INavbarItemMenu {
    slot?: NavbarMenuSlot;
}

const ACTIVE_ORG_STORAGE_KEY = 'CI_ACTIVE_ORG_ID';
const ACTIVE_TENANT_STORAGE_KEY = 'CI_ACTIVE_TENANT_ID';

/**
 * Integra comportamento da barra de navegação padrão, injeção de recursos configurados
 * nas rotas das `ci-application`s e ações contextuais da tela ativa.
 */
@Injectable({
    providedIn: 'root',
})
export class NavbarService implements OnDestroy {
    navbarStartMenu = signal<INavbarItemMenu[]>([]);
    navbarEndMenu = signal<INavbarItemMenu[]>([]);
    navbarUserMenu = signal<INavbarItemMenu[]>([]);

    /** Recursos injetados dinamicamente a partir das configurações de rotas das ci-applications */
    routeStartMenu = signal<INavbarItemMenu[]>([]);
    routeEndMenu = signal<INavbarItemMenu[]>([]);
    routeUserMenu = signal<INavbarItemMenu[]>([]);

    /** Menus finais combinados (manuais + configurados via rotas da ci-application) */
    resolvedStartMenu = computed<INavbarItemMenu[]>(() =>
        this.mergeMenuLists(this.navbarStartMenu(), this.routeStartMenu())
    );
    resolvedEndMenu = computed<INavbarItemMenu[]>(() =>
        this.mergeMenuLists(this.navbarEndMenu(), this.routeEndMenu())
    );
    resolvedUserMenu = computed<INavbarItemMenu[]>(() =>
        this.mergeMenuLists(this.navbarUserMenu(), this.routeUserMenu())
    );

    /** Ações do contexto da tela ativa exibidas na barra de navegação */
    contextActions = signal<NavbarContextAction[]>([]);

    /** Título/rótulo opcional do contexto ativo na navbar */
    contextTitle = signal<string | undefined>(undefined);

    /** Indica se a aplicação de Organização está ativa para o usuário/contexto atual */
    organizationAppActive = signal<boolean>(false);

    /** Informações de acesso à organização exibidas na barra de navegação */
    organizationAccess = signal<NavbarOrganizationAccessInfo | null>(null);

    private subs: Subscription[] = [];
    private activeFromCatalog = false;
    private activeFromRoute = false;
    private activeFromAppsList = false;
    private currentUser?: User;
    private lastLoadedUserId?: string;
    private catalogActivatedApps = new Set<string>();
    private availableAppKeys = new Set<string>();
    private currentAppKey?: string | null;
    private cachedRoutesMetadata: RouteMetadata[] | null = null;
    private loadingRoutesPromise: Promise<void> | null = null;

    constructor(
        @Optional() private readonly catalogService?: ApplicationCatalogService,
        @Optional() private readonly organizacaoService?: OrganizacaoService,
        @Optional() private readonly userAuth?: UserAuthenticationService,
        @Optional() private readonly appsService?: Apps,
        @Optional() private readonly router?: Router,
    ) {
        this.currentUser = this.userAuth?.user?.value;

        if (this.userAuth?.user) {
            this.subs.push(
                this.userAuth.user.subscribe(user => {
                    const prevUserId = this.currentUser?.id;
                    this.currentUser = user;
                    if (!user?.id) {
                        this.lastLoadedUserId = undefined;
                        this.organizationAccess.set(null);
                    } else if (this.organizationAppActive() && (prevUserId !== user.id || !this.organizationAccess())) {
                        this.refreshOrganizationAccess();
                    }

                    if (user?.id && !this.cachedRoutesMetadata) {
                        this.syncRouteResources();
                    } else {
                        this.rebuildRouteMenus();
                    }
                })
            );
        }

        if (this.catalogService?.activatedApps$) {
            this.subs.push(
                this.catalogService.activatedApps$.subscribe(activeSet => {
                    this.catalogActivatedApps = new Set<string>();
                    activeSet?.forEach(key => {
                        const norm = this.normalizeAppKey(key);
                        if (norm) this.catalogActivatedApps.add(norm);
                    });
                    this.activeFromCatalog = this.hasOrganizationKey(activeSet);
                    this.recomputeOrganizationActive();
                    this.rebuildRouteMenus();
                })
            );
        }

        if (this.catalogService?.currentApp$) {
            this.subs.push(
                this.catalogService.currentApp$.subscribe(appKey => {
                    this.currentAppKey = appKey;
                    this.activeFromRoute = this.isOrganizationAppKey(appKey);
                    this.recomputeOrganizationActive();
                    this.rebuildRouteMenus();
                })
            );
        }

        if (this.router?.events) {
            this.subs.push(
                this.router.events
                    .pipe(filter(e => e instanceof NavigationEnd))
                    .subscribe(() => {
                        if (this.cachedRoutesMetadata) {
                            this.rebuildRouteMenus();
                        } else if (this.currentUser?.id || this.hasEagerRouteMetadata()) {
                            this.syncRouteResources();
                        }
                    })
            );
        }

        if (this.currentUser?.id || this.hasEagerRouteMetadata()) {
            this.syncRouteResources();
        }
    }

    ngOnDestroy(): void {
        this.subs.forEach(s => s.unsubscribe());
    }

    private hasEagerRouteMetadata(): boolean {
        const config = this.router?.config;
        if (!Array.isArray(config) || config.length === 0) return false;
        return config.some(r => !r.loadChildren && (Boolean(r.data) || Boolean(r.children?.length)));
    }

    private normalizeAppKey(value?: string | null): string {
        if (!value) return '';
        return value.trim().replace(/^\/+/, '').toLowerCase();
    }

    private isOrganizationAppKey(value?: string | null): boolean {
        return this.normalizeAppKey(value) === 'organizacao';
    }

    private hasOrganizationKey(activeSet?: Set<string> | null): boolean {
        if (!activeSet) return false;
        for (const key of activeSet) {
            if (this.isOrganizationAppKey(key)) return true;
        }
        return false;
    }

    private recomputeOrganizationActive(): void {
        const isActive = Boolean(this.activeFromCatalog || this.activeFromRoute || this.activeFromAppsList);
        const changed = this.organizationAppActive() !== isActive;
        this.organizationAppActive.set(isActive);

        if (!isActive) {
            this.organizationAccess.set(null);
            return;
        }

        if (this.currentUser?.id && (changed || !this.organizationAccess() || this.lastLoadedUserId !== this.currentUser.id)) {
            this.refreshOrganizationAccess();
        }
    }

    /**
     * Sincroniza a lista de aplicativos disponíveis recebida pela Navbar
     * para detectar se a aplicação de Organização está ativa para o usuário
     * e atualizar a disponibilidade dos recursos declarados nas rotas.
     */
    syncAvailableApps(apps?: any[]): void {
        this.availableAppKeys = new Set<string>();
        if (Array.isArray(apps)) {
            for (const app of apps) {
                for (const candidate of [app?.name, app?.appKey, app?.url]) {
                    const norm = this.normalizeAppKey(candidate);
                    if (norm) this.availableAppKeys.add(norm);
                }
            }
        }
        const hasOrgApp = Array.isArray(apps) && apps.some(app =>
            this.isOrganizationAppKey(app?.name) ||
            this.isOrganizationAppKey(app?.appKey) ||
            this.isOrganizationAppKey(app?.url)
        );
        this.activeFromAppsList = hasOrgApp;
        this.recomputeOrganizationActive();
        this.rebuildRouteMenus();
    }

    /**
     * Descobre e injeta recursos de navbar configurados nas rotas das `ci-application`s
     * via `Apps.getRoutesMetadata()` (ou `Router.config` síncrono em fallback).
     */
    async syncRouteResources(forceRefresh = false): Promise<void> {
        if (!forceRefresh && this.loadingRoutesPromise) {
            return this.loadingRoutesPromise;
        }

        const runner = (async () => {
            try {
                let metadata: RouteMetadata[] = [];
                if (this.appsService && typeof this.appsService.getRoutesMetadata === 'function') {
                    metadata = (await this.appsService.getRoutesMetadata(forceRefresh)) || [];
                } else if (this.router?.config) {
                    metadata = this.extractSyncRouteMetadata(this.router.config, '');
                }
                this.cachedRoutesMetadata = metadata;
                this.rebuildRouteMenus();
            } catch {
                // Mantém estado atual caso alguma rota lazy falhe na inspeção
            } finally {
                this.loadingRoutesPromise = null;
            }
        })();

        this.loadingRoutesPromise = runner;
        return runner;
    }

    /**
     * Permite registrar/atualizar metadados de rotas diretamente (ex.: módulos dinâmicos ou testes).
     */
    setRouteMetadata(routesMeta: RouteMetadata[]): void {
        this.cachedRoutesMetadata = Array.isArray(routesMeta) ? routesMeta : [];
        this.rebuildRouteMenus();
    }

    private extractSyncRouteMetadata(routes: Route[], parentPath: string): RouteMetadata[] {
        const result: RouteMetadata[] = [];
        for (const route of routes) {
            if (route.path === '**') continue;
            const seg = route.path != null && route.path !== '' ? `/${route.path}` : '';
            const fullPath = (`${parentPath}${seg}`.replace(/\/+/g, '/')) || '/';
            if (route.data || typeof route.title === 'string') {
                result.push({
                    fullPath,
                    ...(typeof route.title === 'string' ? { title: route.title } : {}),
                    ...(route.data || {}),
                    routeConfig: route,
                });
            }
            if (route.children?.length) {
                result.push(...this.extractSyncRouteMetadata(route.children, fullPath));
            }
        }
        return result;
    }

    private rebuildRouteMenus(): void {
        const metaList = this.cachedRoutesMetadata;
        if (!metaList || metaList.length === 0) {
            this.routeStartMenu.set([]);
            this.routeEndMenu.set([]);
            this.routeUserMenu.set([]);
            return;
        }

        const startItems: INavbarItemMenu[] = [];
        const endItems: INavbarItemMenu[] = [];
        const userItems: INavbarItemMenu[] = [];

        for (const meta of metaList) {
            const entries = this.extractNavbarEntriesFromRouteMeta(meta);
            for (const entry of entries) {
                const resolved = this.resolveRouteEntryIfEligible(entry, meta);
                if (!resolved) continue;

                const slot = this.normalizeSlot(resolved.slot || resolved.group);
                if (slot === 'start') {
                    startItems.push(resolved);
                } else if (slot === 'user-menu') {
                    userItems.push(resolved);
                } else {
                    endItems.push(resolved);
                }
            }
        }

        this.routeStartMenu.set(this.sortAndDedupe(startItems));
        this.routeEndMenu.set(this.sortAndDedupe(endItems));
        this.routeUserMenu.set(this.sortAndDedupe(userItems));
    }

    private extractNavbarEntriesFromRouteMeta(meta: RouteMetadata): INavbarItemMenu[] {
        const entries: INavbarItemMenu[] = [];
        const pushFromSource = (src: any, forcedSlot?: NavbarMenuSlot) => {
            if (!src) return;
            const list = Array.isArray(src) ? src : [src];
            for (const raw of list) {
                if (!raw || typeof raw !== 'object') continue;
                entries.push({
                    ...raw,
                    ...(forcedSlot ? { slot: forcedSlot } : {}),
                });
            }
        };

        pushFromSource(meta.navbar);
        pushFromSource(meta.startMenu, 'start');
        pushFromSource(meta.endMenu, 'end');
        pushFromSource(meta.userMenu, 'user-menu');

        if (entries.length === 0 && meta.group) {
            const slotFromGroup = this.tryParseSlot(meta.group);
            if (slotFromGroup) {
                entries.push({
                    id: `route:${meta.fullPath}:${slotFromGroup}`,
                    label: meta.title || meta.appName || this.inferLabelFromPath(meta.fullPath),
                    icon: meta.icon,
                    routerLink: meta.fullPath,
                    roles: meta.roles || (meta.role ? [meta.role] : undefined),
                    appKey: meta.appName,
                    slot: slotFromGroup,
                    group: meta.group,
                });
            }
        }

        return entries;
    }

    private resolveRouteEntryIfEligible(entry: INavbarItemMenu, meta: RouteMetadata): INavbarItemMenu | null {
        const user = this.currentUser || this.userAuth?.user?.value;
        const requiresAuth = entry.requiresAuth !== false;
        if (requiresAuth && !user?.id) {
            return null;
        }

        if (typeof entry.visible === 'function' && !entry.visible()) {
            return null;
        }
        if (entry.visible === false) {
            return null;
        }

        const effectiveRoles = entry.roles ?? meta.roles ?? (meta.role ? [meta.role] : undefined);
        if (Array.isArray(effectiveRoles) && effectiveRoles.length > 0) {
            const userRoles = user?.roles || [];
            if (!effectiveRoles.some(r => userRoles.includes(r))) {
                return null;
            }
        }

        const appKey = entry.appKey || meta.appName || this.inferLabelFromPath(meta.fullPath);
        if (entry.checkAppAvailability && !this.isAppAvailable(appKey)) {
            return null;
        }

        const filteredChildren = Array.isArray(entry.children)
            ? entry.children
                .map(child => this.resolveRouteEntryIfEligible({
                    ...child,
                    appKey: child.appKey || appKey,
                    requiresAuth: child.requiresAuth ?? requiresAuth,
                }, meta))
                .filter((c): c is INavbarItemMenu => Boolean(c))
            : undefined;

        const hasCustomBehavior = Boolean(
            entry.routerLink ||
            entry.component ||
            entry.menuComponent ||
            entry.dialogComponent ||
            entry.onClick ||
            entry.href ||
            (filteredChildren && filteredChildren.length > 0)
        );

        return {
            ...entry,
            id: entry.id || `route:${meta.fullPath}:${entry.label || entry.icon || 'item'}`,
            label: entry.label ?? entry.title ?? meta.title,
            tooltip: entry.tooltip ?? entry.label ?? entry.title ?? meta.title,
            icon: entry.icon ?? meta.icon,
            appKey,
            roles: effectiveRoles,
            children: filteredChildren,
            ...(hasCustomBehavior ? {} : { routerLink: meta.fullPath }),
        };
    }

    private isAppAvailable(appKey?: string): boolean {
        const norm = this.normalizeAppKey(appKey);
        if (!norm) return true;
        if (this.normalizeAppKey(this.currentAppKey) === norm) return true;
        if (this.catalogActivatedApps.has(norm)) return true;
        if (this.availableAppKeys.has(norm)) return true;
        return false;
    }

    private tryParseSlot(value?: string): NavbarMenuSlot | null {
        const norm = (value || '').trim().toLowerCase();
        if (norm === 'start' || norm === 'navbar-start' || norm === 'start-menu') return 'start';
        if (norm === 'end' || norm === 'navbar-end' || norm === 'end-menu') return 'end';
        if (norm === 'user-menu' || norm === 'user' || norm === 'usermenu') return 'user-menu';
        return null;
    }

    private normalizeSlot(value?: string): NavbarMenuSlot {
        return this.tryParseSlot(value) || 'end';
    }

    private inferLabelFromPath(fullPath: string): string {
        const segments = (fullPath || '').split('/').filter(Boolean);
        return segments[segments.length - 1] || 'App';
    }

    private mergeMenuLists(manual: INavbarItemMenu[], fromRoutes: INavbarItemMenu[]): INavbarItemMenu[] {
        return this.sortAndDedupe([...(manual || []), ...(fromRoutes || [])]);
    }

    private sortAndDedupe(items: INavbarItemMenu[]): INavbarItemMenu[] {
        const map = new Map<string, INavbarItemMenu>();
        for (const item of items) {
            if (!item) continue;
            const key = item.id || `${typeof item.routerLink === 'string' ? item.routerLink : ''}::${item.label || ''}::${item.icon || ''}`;
            if (!map.has(key)) {
                map.set(key, item);
            }
        }
        return Array.from(map.values()).sort((a, b) => (a.order ?? 100) - (b.order ?? 100));
    }

    setOrganizationAppActive(active: boolean): void {
        this.activeFromAppsList = active;
        this.recomputeOrganizationActive();
    }

    setOrganizationAccess(info: NavbarOrganizationAccessInfo | null): void {
        this.organizationAccess.set(info);
    }

    async refreshOrganizationAccess(): Promise<NavbarOrganizationAccessInfo | null> {
        if (!this.organizationAppActive()) {
            this.organizationAccess.set(null);
            return null;
        }

        const user = this.currentUser || this.userAuth?.user?.value;
        if (!user?.id) {
            this.organizationAccess.set(null);
            return null;
        }

        if (!this.organizacaoService || typeof this.organizacaoService.minhasOrganizacoes !== 'function') {
            const fallbackRoles = (user.roles || []).filter(r => r.startsWith('ORG'));
            const fallbackInfo: NavbarOrganizationAccessInfo = {
                active: true,
                roles: fallbackRoles,
                organizations: [],
                loading: false,
            };
            this.organizationAccess.set(fallbackInfo);
            return fallbackInfo;
        }

        const previous = this.organizationAccess();
        this.organizationAccess.set({
            active: true,
            organizationId: previous?.organizationId,
            organizationName: previous?.organizationName,
            tenantId: previous?.tenantId,
            tenantName: previous?.tenantName,
            isOwner: previous?.isOwner,
            roles: previous?.roles || [],
            organizations: previous?.organizations || [],
            loading: true,
        });

        try {
            this.lastLoadedUserId = user.id;
            const orgs = (await lastValueFrom(this.organizacaoService.minhasOrganizacoes())) || [];
            const info = this.buildAccessInfoFromOrganizations(orgs, user);
            this.organizationAccess.set(info);
            return info;
        } catch {
            const fallbackRoles = (user.roles || []).filter(r => r.startsWith('ORG'));
            const info: NavbarOrganizationAccessInfo = {
                active: true,
                roles: fallbackRoles,
                organizations: [],
                loading: false,
            };
            this.organizationAccess.set(info);
            return info;
        }
    }

    selectActiveOrganization(organizationId: string): NavbarOrganizationAccessInfo | null {
        const current = this.organizationAccess();
        const orgs = current?.organizations || [];
        const selected = orgs.find(o => o.internalId === organizationId);
        if (!selected) return current;

        const user = this.currentUser || this.userAuth?.user?.value;
        const nextInfo = this.createAccessInfoForOrg(selected, orgs, user);
        this.persistActiveOrgSelection(nextInfo.organizationId, nextInfo.tenantId);
        this.organizationAccess.set(nextInfo);
        return nextInfo;
    }

    private buildAccessInfoFromOrganizations(orgs: OrganizacaoResumoDto[], user?: User): NavbarOrganizationAccessInfo {
        if (!orgs || orgs.length === 0) {
            const orgRoles = (user?.roles || []).filter(r => r.startsWith('ORG'));
            return {
                active: true,
                roles: orgRoles,
                organizations: [],
                loading: false,
            };
        }

        let storedOrgId: string | undefined;
        let storedTenantId: string | undefined;
        if (typeof localStorage !== 'undefined') {
            try {
                storedOrgId = localStorage.getItem(ACTIVE_ORG_STORAGE_KEY) || undefined;
                storedTenantId = localStorage.getItem(ACTIVE_TENANT_STORAGE_KEY) || undefined;
            } catch { }
        }

        const currentSelectedId = this.organizationAccess()?.organizationId;
        const selected =
            orgs.find(o => currentSelectedId && o.internalId === currentSelectedId) ||
            orgs.find(o => storedOrgId && o.internalId === storedOrgId) ||
            orgs.find(o => storedTenantId && (o.tenantId === storedTenantId || o.tenant?.id === storedTenantId)) ||
            orgs[0];

        const info = this.createAccessInfoForOrg(selected, orgs, user);
        this.persistActiveOrgSelection(info.organizationId, info.tenantId);
        return info;
    }

    private createAccessInfoForOrg(
        org: OrganizacaoResumoDto,
        orgs: OrganizacaoResumoDto[],
        user?: User,
    ): NavbarOrganizationAccessInfo {
        const tenantId = org.tenantId || org.tenant?.id || undefined;
        const tenantName = org.tenant?.name || undefined;
        const roles = Array.isArray(org.myRoles) && org.myRoles.length > 0
            ? org.myRoles
            : (org.isOwner ? ['ORG_ADMIN'] : (user?.roles || []).filter(r => r.startsWith('ORG')));

        return {
            active: true,
            organizationId: org.internalId || undefined,
            organizationName: org.organizatioName || 'Organização',
            tenantId,
            tenantName,
            isOwner: Boolean(org.isOwner),
            roles,
            organizations: orgs,
            loading: false,
        };
    }

    private persistActiveOrgSelection(organizationId?: string, tenantId?: string): void {
        if (typeof localStorage === 'undefined') return;
        try {
            if (organizationId) {
                localStorage.setItem(ACTIVE_ORG_STORAGE_KEY, organizationId);
            }
            if (tenantId) {
                localStorage.setItem(ACTIVE_TENANT_STORAGE_KEY, tenantId);
            }
        } catch { }
    }

    async addStartOption(item_menu?: INavbarItemMenu) {
        if (!item_menu) return;
        this.navbarStartMenu.update(items => [...items, item_menu]);
    }

    async addOption(item_menu?: INavbarItemMenu) {
        if (!item_menu) return;
        this.navbarEndMenu.update(items => [...items, item_menu]);
    }

    async addUserMenuOption(item_menu?: INavbarItemMenu) {
        if (!item_menu) return;
        this.navbarUserMenu.update(items => [...items, item_menu]);
    }

    setStartMenu(items: INavbarItemMenu[]): void {
        this.navbarStartMenu.set(items || []);
    }

    setEndMenu(items: INavbarItemMenu[]): void {
        this.navbarEndMenu.set(items || []);
    }

    setUserMenu(items: INavbarItemMenu[]): void {
        this.navbarUserMenu.set(items || []);
    }

    setContextActions(actions: NavbarContextAction[], title?: string): void {
        this.contextActions.set(actions || []);
        this.contextTitle.set(title);
    }

    clearContextActions(): void {
        this.contextActions.set([]);
        this.contextTitle.set(undefined);
    }
}
