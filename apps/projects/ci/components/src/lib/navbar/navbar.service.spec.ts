import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, of } from 'rxjs';
import { UserAuthenticationService } from '@ci/auth';
import { ApplicationCatalogService } from '@ci/core';
import { OrganizacaoResumoDto, OrganizacaoService, User } from '@ci/portal-api';
import { NavbarComponent } from './navbar.component';
import { NavbarModule } from './navbar.module';
import { NavbarService } from './navbar.service';

describe('NavbarService e NavbarComponent (Organização)', () => {
    let user$: BehaviorSubject<User | undefined>;
    let activatedApps$: BehaviorSubject<Set<string>>;
    let currentApp$: BehaviorSubject<string | null>;
    let orgApiSpy: jasmine.SpyObj<Pick<OrganizacaoService, 'minhasOrganizacoes'>>;

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
    });
});
