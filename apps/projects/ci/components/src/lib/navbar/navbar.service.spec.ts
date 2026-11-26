import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, of } from 'rxjs';
import { UserAuthenticationService } from '@ci/auth';
import { ApplicationCatalogService, Apps, RouteMetadata } from '@ci/core';
import {
    InternalNotificationService,
    NotificationDisplayMode,
    OrganizacaoResumoDto,
    OrganizacaoService,
    User,
} from '@ci/portal-api';
import { NavbarComponent } from './navbar.component';
import { NavbarModule } from './navbar.module';
import { NavbarService } from './navbar.service';

@Component({
    standalone: true,
    template: `<span class="mock-deployer-panel">Deployer Mock</span>`,
})
class MockDeployerMenuComponent { }

describe('NavbarService e NavbarComponent (Organização e Rotas ci-application)', () => {
    let user$: BehaviorSubject<User | undefined>;
    let activatedApps$: BehaviorSubject<Set<string>>;
    let currentApp$: BehaviorSubject<string | null>;
    let orgApiSpy: jasmine.SpyObj<Pick<OrganizacaoService, 'minhasOrganizacoes'>>;
    let appsServiceSpy: jasmine.SpyObj<Pick<Apps, 'getRoutesMetadata'>>;

    const mockRoutesMetadata: RouteMetadata[] = [
        {
            fullPath: '/DevTools',
            appName: 'DevTools',
            title: 'DevTools Inspector',
            icon: 'terminal',
            navbar: {
                id: 'devtools-deployer',
                slot: 'end',
                icon: 'deployed_code',
                tooltip: 'Deployer — Versão e Publicação',
                roles: ['DEVELOPER'],
                order: 10,
                menuComponent: MockDeployerMenuComponent,
            },
        },
        {
            fullPath: '/Grupos',
            appName: 'Grupos',
            title: 'Grupos e Comunidades',
            icon: 'groups',
            navbar: {
                id: 'grupos-comunidades',
                slot: 'end',
                icon: 'groups',
                tooltip: 'Grupos e Comunidades',
                roles: ['USER', 'ADMIN', 'MASTER'],
                order: 20,
                children: [
                    { id: 'grupos-encontrar', label: 'Encontrar grupos', icon: 'search', routerLink: '/Grupos' },
                ],
            },
        },
        {
            fullPath: '/Profile/seguranca',
            appName: 'Profile',
            title: 'Segurança',
            icon: 'security',
            group: 'user-menu',
        },
    ];

    const mockOrgs: OrganizacaoResumoDto[] = [
        {
            internalId: 'org-1',
            organizatioName: 'CI Labs',
            tenantId: 'tenant-1',
            tenantName: 'ORG: CI Labs',
            isOwner: true,
            myRoles: ['ORG_ADMIN', 'ORG_FINANCEIRO'],
            membersCount: 3,
            rolesCount: 2,
        } as OrganizacaoResumoDto,
        {
            internalId: 'org-2',
            organizatioName: 'Parceira SA',
            tenantId: 'tenant-2',
            tenantName: 'ORG: Parceira SA',
            isOwner: false,
            myRoles: ['ORG_VIEWER'],
            membersCount: 5,
            rolesCount: 1,
        } as OrganizacaoResumoDto,
    ];

    beforeEach(() => {
        localStorage.removeItem('CI_ACTIVE_ORG_ID');
        localStorage.removeItem('CI_ACTIVE_TENANT_ID');
        localStorage.removeItem('NAV(RECENTES)');

        user$ = new BehaviorSubject<User | undefined>({
            id: 'user-1',
            username: 'paulo',
            roles: ['USER', 'ORG_ADMIN'],
        } as User);
        activatedApps$ = new BehaviorSubject<Set<string>>(new Set<string>());
        currentApp$ = new BehaviorSubject<string | null>(null);

        orgApiSpy = jasmine.createSpyObj('OrganizacaoService', ['minhasOrganizacoes']);
        orgApiSpy.minhasOrganizacoes.and.returnValue(of(mockOrgs));

        appsServiceSpy = jasmine.createSpyObj('Apps', ['getRoutesMetadata']);
        appsServiceSpy.getRoutesMetadata.and.returnValue(Promise.resolve(mockRoutesMetadata));
    });

    afterEach(() => {
        localStorage.removeItem('CI_ACTIVE_ORG_ID');
        localStorage.removeItem('CI_ACTIVE_TENANT_ID');
        localStorage.removeItem('NAV(RECENTES)');
    });

    describe('NavbarService', () => {
        let service: NavbarService;

        beforeEach(() => {
            TestBed.configureTestingModule({
                providers: [
                    NavbarService,
                    { provide: UserAuthenticationService, useValue: { user: user$ } },
                    {
                        provide: ApplicationCatalogService,
                        useValue: { activatedApps$, currentApp$ },
                    },
                    { provide: OrganizacaoService, useValue: orgApiSpy },
                    { provide: Apps, useValue: appsServiceSpy },
                ],
            });
            service = TestBed.inject(NavbarService);
        });

        it('deve permanecer inativo e sem acesso enquanto o app Organização não estiver ativo', () => {
            expect(service.organizationAppActive()).toBeFalse();
            expect(service.organizationAccess()).toBeNull();
            expect(orgApiSpy.minhasOrganizacoes).not.toHaveBeenCalled();
        });

        it('deve ativar e carregar informações de acesso quando Organização estiver em activatedApps$', async () => {
            activatedApps$.next(new Set(['Organizacao']));
            await Promise.resolve();
            await Promise.resolve();

            expect(service.organizationAppActive()).toBeTrue();
            expect(orgApiSpy.minhasOrganizacoes).toHaveBeenCalled();

            const access = service.organizationAccess();
            expect(access).toBeTruthy();
            expect(access?.organizationId).toBe('org-1');
            expect(access?.organizationName).toBe('CI Labs');
            expect(access?.tenantId).toBe('tenant-1');
            expect(access?.isOwner).toBeTrue();
            expect(access?.roles).toEqual(['ORG_ADMIN', 'ORG_FINANCEIRO']);
        });

        it('deve ativar via syncAvailableApps() e alternar organização ativa persistindo CI_ACTIVE_TENANT_ID', async () => {
            service.syncAvailableApps([{ name: 'Organizacao' }]);
            await Promise.resolve();
            await Promise.resolve();

            expect(service.organizationAppActive()).toBeTrue();

            const switched = service.selectActiveOrganization('org-2');
            expect(switched?.organizationId).toBe('org-2');
            expect(switched?.organizationName).toBe('Parceira SA');
            expect(switched?.tenantId).toBe('tenant-2');
            expect(switched?.isOwner).toBeFalse();
            expect(switched?.roles).toEqual(['ORG_VIEWER']);
            expect(localStorage.getItem('CI_ACTIVE_ORG_ID')).toBe('org-2');
            expect(localStorage.getItem('CI_ACTIVE_TENANT_ID')).toBe('tenant-2');
        });

        it('deve injetar recursos na navbar a partir das configurações das rotas da ci-application respeitando roles', async () => {
            await service.syncRouteResources(true);

            // Usuário padrão (sem DEVELOPER) recebe Grupos em endMenu e Segurança em user-menu, mas NÃO Deployer
            expect(service.resolvedEndMenu().map(i => i.id)).toEqual(['grupos-comunidades']);
            expect(service.resolvedUserMenu().some(i => i.routerLink === '/Profile/seguranca')).toBeTrue();

            // Usuário com DEVELOPER passa a receber também o Deployer configurado em DevTools
            user$.next({
                id: 'user-dev',
                username: 'dev',
                roles: ['USER', 'DEVELOPER'],
            } as User);

            expect(service.resolvedEndMenu().map(i => i.id)).toEqual(['devtools-deployer', 'grupos-comunidades']);

            // Ao remover a rota ou deslogar, os recursos deixam de ser injetados
            user$.next(undefined);
            expect(service.resolvedEndMenu()).toEqual([]);
            expect(service.resolvedUserMenu()).toEqual([]);
        });
    });

    describe('NavbarComponent', () => {
        let fixture: ComponentFixture<NavbarComponent>;
        let component: NavbarComponent;
        let navbarService: NavbarService;

        beforeEach(async () => {
            await TestBed.configureTestingModule({
                imports: [NavbarModule, NoopAnimationsModule, RouterTestingModule],
                providers: [
                    NavbarService,
                    {
                        provide: UserAuthenticationService,
                        useValue: { user: user$, sair: jasmine.createSpy('sair') },
                    },
                    {
                        provide: ApplicationCatalogService,
                        useValue: { activatedApps$, currentApp$ },
                    },
                    { provide: OrganizacaoService, useValue: orgApiSpy },
                    { provide: Apps, useValue: appsServiceSpy },
                ],
            }).compileComponents();

            navbarService = TestBed.inject(NavbarService);
            fixture = TestBed.createComponent(NavbarComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('deve ocultar o indicador de organização quando organizationAppActive() for false', () => {
            expect(navbarService.organizationAppActive()).toBeFalse();
            const trigger = fixture.nativeElement.querySelector('.org-access-btn');
            expect(trigger).toBeNull();
        });

        it('deve exibir o indicador de acesso à organização quando organizationAppActive() for true', async () => {
            activatedApps$.next(new Set(['Organizacao']));
            await Promise.resolve();
            await Promise.resolve();
            fixture.detectChanges();

            const trigger: HTMLElement | null = fixture.nativeElement.querySelector('.org-access-btn');
            expect(trigger).not.toBeNull();
            expect(trigger?.textContent).toContain('CI Labs');
            expect(trigger?.textContent).toContain('Criador');
            expect(trigger?.textContent).toContain('ORG_ADMIN');
        });

        it('deve renderizar em endMenu os recursos injetados pelas configurações das rotas e pelo Input endMenu', async () => {
            await navbarService.syncRouteResources(true);
            component.endMenu = [
                { id: 'manual-end-item', label: 'Ajuda', icon: 'help' },
            ];
            fixture.detectChanges();

            const endMenuContainer: HTMLElement | null = fixture.nativeElement.querySelector('.navbar-end-menu');
            expect(endMenuContainer).not.toBeNull();
            const dynamicButtons = endMenuContainer!.querySelectorAll('.nav-dynamic-btn');
            expect(dynamicButtons.length).toBe(2);
            expect(endMenuContainer?.textContent).toContain('Ajuda');

            // Ao conceder role DEVELOPER, o item de Deployer configurado em DevTools também é renderizado
            user$.next({
                id: 'user-dev',
                username: 'dev',
                roles: ['USER', 'DEVELOPER'],
            } as User);
            fixture.detectChanges();

            expect(endMenuContainer!.querySelectorAll('.nav-dynamic-btn').length).toBe(3);
        });
    });

    describe('NavbarComponent (Preferências de Notificações)', () => {
        let fixture: ComponentFixture<NavbarComponent>;
        let component: NavbarComponent;
        let displayMode$: BehaviorSubject<NotificationDisplayMode>;
        let notificationsEnabled$: BehaviorSubject<boolean>;
        let pushEnabled$: BehaviorSubject<boolean>;
        let soundEnabled$: BehaviorSubject<boolean>;
        let notifications$: BehaviorSubject<any[]>;
        let unreadCount$: BehaviorSubject<number>;
        let isSidebarOpen$: BehaviorSubject<boolean>;
        let isStatusbarExpanded$: BehaviorSubject<boolean>;
        let pushPermissionStatus$: BehaviorSubject<NotificationPermission>;
        let notifSpy: any;

        beforeEach(async () => {
            displayMode$ = new BehaviorSubject<NotificationDisplayMode>('menu');
            notificationsEnabled$ = new BehaviorSubject<boolean>(true);
            pushEnabled$ = new BehaviorSubject<boolean>(true);
            soundEnabled$ = new BehaviorSubject<boolean>(true);
            notifications$ = new BehaviorSubject<any[]>([
                { id: 'n1', title: 'Alerta', message: 'Teste', type: 'SISTEMA', read: false, createdAt: new Date().toISOString() },
            ]);
            unreadCount$ = new BehaviorSubject<number>(1);
            isSidebarOpen$ = new BehaviorSubject<boolean>(false);
            isStatusbarExpanded$ = new BehaviorSubject<boolean>(false);
            pushPermissionStatus$ = new BehaviorSubject<NotificationPermission>('default');

            notifSpy = {
                displayMode$,
                get displayMode() { return displayMode$.value; },
                notificationsEnabled$,
                pushEnabled$,
                soundEnabled$,
                notifications$,
                unreadCount$,
                isSidebarOpen$,
                isStatusbarExpanded$,
                pushPermissionStatus: pushPermissionStatus$,
                get preferences() {
                    return {
                        enabled: notificationsEnabled$.value,
                        displayMode: displayMode$.value,
                        pushEnabled: pushEnabled$.value,
                        soundEnabled: soundEnabled$.value,
                        mutedTypes: [],
                    };
                },
                setDisplayMode: jasmine.createSpy('setDisplayMode').and.callFake((m: NotificationDisplayMode) => displayMode$.next(m)),
                setNotificationsEnabled: jasmine.createSpy('setNotificationsEnabled').and.callFake((v: boolean) => notificationsEnabled$.next(v)),
                setPushEnabled: jasmine.createSpy('setPushEnabled').and.callFake((v: boolean) => pushEnabled$.next(v)),
                setSoundEnabled: jasmine.createSpy('setSoundEnabled').and.callFake((v: boolean) => soundEnabled$.next(v)),
                toggleMutedType: jasmine.createSpy('toggleMutedType'),
                isTypeMuted: jasmine.createSpy('isTypeMuted').and.returnValue(false),
                toggleSidebar: jasmine.createSpy('toggleSidebar').and.callFake((v?: boolean) => isSidebarOpen$.next(v ?? !isSidebarOpen$.value)),
                toggleStatusbar: jasmine.createSpy('toggleStatusbar').and.callFake((v?: boolean) => isStatusbarExpanded$.next(v ?? !isStatusbarExpanded$.value)),
                marcarComoLida: jasmine.createSpy('marcarComoLida').and.returnValue(of({ success: true })),
            };

            await TestBed.configureTestingModule({
                imports: [NavbarModule, NoopAnimationsModule, RouterTestingModule],
                providers: [
                    NavbarService,
                    { provide: UserAuthenticationService, useValue: { user: user$, sair: jasmine.createSpy('sair') } },
                    { provide: ApplicationCatalogService, useValue: { activatedApps$, currentApp$ } },
                    { provide: OrganizacaoService, useValue: orgApiSpy },
                    { provide: Apps, useValue: appsServiceSpy },
                    { provide: InternalNotificationService, useValue: notifSpy },
                ],
            }).compileComponents();

            fixture = TestBed.createComponent(NavbarComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('deve renderizar aba lateral no modo sidebar e statusbar inferior no modo statusbar conforme preferência', () => {
            expect(fixture.nativeElement.querySelector('.ci-notif-lateral-tab')).toBeNull();
            expect(fixture.nativeElement.querySelector('.ci-notif-bottom-statusbar')).toBeNull();

            displayMode$.next('sidebar');
            fixture.detectChanges();
            expect(fixture.nativeElement.querySelector('.ci-notif-lateral-tab')).not.toBeNull();
            expect(fixture.nativeElement.querySelector('.ci-notif-bottom-statusbar')).toBeNull();

            displayMode$.next('statusbar');
            fixture.detectChanges();
            expect(fixture.nativeElement.querySelector('.ci-notif-lateral-tab')).toBeNull();
            const footer: HTMLElement | null = fixture.nativeElement.querySelector('.ci-notif-bottom-statusbar');
            expect(footer).not.toBeNull();
            expect(footer?.textContent).toContain('Alerta');
        });

        it('deve ocultar os controles de notificação quando notificationsEnabled$ for false', () => {
            expect(fixture.nativeElement.querySelector('.notif-btn')).not.toBeNull();

            notificationsEnabled$.next(false);
            displayMode$.next('sidebar');
            fixture.detectChanges();

            expect(fixture.nativeElement.querySelector('.notif-btn')).toBeNull();
            expect(fixture.nativeElement.querySelector('.ci-notif-lateral-tab')).toBeNull();
            expect(component.isNotificationTypeMuted('MENSAGEM')).toBeFalse();
        });
    });
});
