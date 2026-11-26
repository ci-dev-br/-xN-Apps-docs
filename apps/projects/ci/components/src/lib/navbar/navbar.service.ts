import { Injectable, OnDestroy, Optional, signal } from "@angular/core";
import { UserAuthenticationService } from "@ci/auth";
import { ApplicationCatalogService } from "@ci/core";
import { OrganizacaoResumoDto, OrganizacaoService, User } from "@ci/portal-api";
import { lastValueFrom, Subscription } from "rxjs";
import { INavbarItemMenu } from "./i-menu-item";

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

const ACTIVE_ORG_STORAGE_KEY = 'CI_ACTIVE_ORG_ID';
const ACTIVE_TENANT_STORAGE_KEY = 'CI_ACTIVE_TENANT_ID';

/**
 * Integra comportamento da barra de navegação padrão e ações contextuais da tela ativa.
 */
@Injectable({
    providedIn: 'root',
})
export class NavbarService implements OnDestroy {
    navbarStartMenu = signal<INavbarItemMenu[]>([]);
    navbarEndMenu = signal<INavbarItemMenu[]>([]);

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

    constructor(
        @Optional() private readonly catalogService?: ApplicationCatalogService,
        @Optional() private readonly organizacaoService?: OrganizacaoService,
        @Optional() private readonly userAuth?: UserAuthenticationService,
    ) {
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
                })
            );
        }

        if (this.catalogService?.activatedApps$) {
            this.subs.push(
                this.catalogService.activatedApps$.subscribe(activeSet => {
                    this.activeFromCatalog = this.hasOrganizationKey(activeSet);
                    this.recomputeOrganizationActive();
                })
            );
        }

        if (this.catalogService?.currentApp$) {
            this.subs.push(
                this.catalogService.currentApp$.subscribe(appKey => {
                    this.activeFromRoute = this.isOrganizationAppKey(appKey);
                    this.recomputeOrganizationActive();
                })
            );
        }
    }

    ngOnDestroy(): void {
        this.subs.forEach(s => s.unsubscribe());
    }

    private isOrganizationAppKey(value?: string | null): boolean {
        if (!value) return false;
        const normalized = value.trim().replace(/^\/+/, '').toLowerCase();
        return normalized === 'organizacao';
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
     * para detectar se a aplicação de Organização está ativa para o usuário.
     */
    syncAvailableApps(apps?: any[]): void {
        const hasOrgApp = Array.isArray(apps) && apps.some(app =>
            this.isOrganizationAppKey(app?.name) ||
            this.isOrganizationAppKey(app?.appKey) ||
            this.isOrganizationAppKey(app?.url)
        );
        this.activeFromAppsList = hasOrgApp;
        this.recomputeOrganizationActive();
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

    async addOption(item_menu?: INavbarItemMenu) {
        if (!item_menu) return;
        this.navbarEndMenu.update(items => [...items, item_menu]);
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
