import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject, of } from 'rxjs';
import { UserAuthenticationService } from '@ci/auth';
import { AuthService, OrganizacaoService, User } from '@ci/portal-api';
import { Principal } from './principal';

describe('Organizacao Principal', () => {
    let fixture: ComponentFixture<Principal>;
    let component: Principal;
    let orgApiSpy: any;
    let user$: BehaviorSubject<User | undefined>;

    const mockOrg = {
        internalId: 'org-1',
        organizatioName: 'CI Labs',
        tenantId: 'tenant-1',
        tenant: { id: 'tenant-1', name: 'ORG: CI Labs' },
        isOwner: true,
        myRoles: ['ORG_ADMIN'],
        membersCount: 1,
        rolesCount: 2,
        members: [
            {
                internalId: 'mem-1',
                organizacaoId: 'org-1',
                tenantId: 'tenant-1',
                userId: 'u-1',
                userName: 'Criador',
                userEmail: 'criador@ci.dev.br',
                isOwner: true,
                roles: ['ORG_ADMIN'],
                status: 'ACTIVE',
            },
        ],
        orgRoles: [
            { internalId: 'role-1', organizacaoId: 'org-1', code: 'ORG_ADMIN', customName: 'Administrador' },
            { internalId: 'role-2', organizacaoId: 'org-1', code: 'ORG_MEMBRO', customName: 'Membro' },
        ],
    };

    beforeEach(async () => {
        user$ = new BehaviorSubject<User | undefined>({ id: 'u-1', username: 'criador', roles: ['USER'] });
        orgApiSpy = {
            minhasOrganizacoes: jasmine.createSpy('minhasOrganizacoes').and.returnValue(of([mockOrg])),
            obterDetalhes: jasmine.createSpy('obterDetalhes').and.returnValue(of(mockOrg)),
            criarOrganizacao: jasmine.createSpy('criarOrganizacao').and.returnValue(of(mockOrg)),
            criarRole: jasmine.createSpy('criarRole').and.returnValue(of({
                internalId: 'role-3',
                organizacaoId: 'org-1',
                code: 'ORG_FINANCEIRO',
                customName: 'Financeiro',
            })),
            compartilharComUsuario: jasmine.createSpy('compartilharComUsuario').and.returnValue(of({
                internalId: 'mem-2',
                organizacaoId: 'org-1',
                tenantId: 'tenant-1',
                userId: 'u-2',
                userName: 'Colega',
                userEmail: 'colega@ci.dev.br',
                isOwner: false,
                roles: ['ORG_FINANCEIRO'],
                status: 'ACTIVE',
            })),
            buscarUsuarios: jasmine.createSpy('buscarUsuarios').and.returnValue(of([])),
        };

        await TestBed.configureTestingModule({
            imports: [Principal, NoopAnimationsModule],
            providers: [
                { provide: OrganizacaoService, useValue: orgApiSpy },
                { provide: UserAuthenticationService, useValue: { user: user$, atualizarPerfilConta: jasmine.createSpy() } },
                { provide: AuthService, useValue: { profile: () => of({ id: 'u-1', roles: ['USER', 'ORG_ADMIN'] }) } },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(Principal);
        component = fixture.componentInstance;
        fixture.detectChanges();
        await fixture.whenStable();
    });

    it('deve carregar organizações e gerar preview de role com prefixo ORG', () => {
        expect(component.organizacoes.length).toBe(1);
        expect(component.selectedOrg?.tenantId).toBe('tenant-1');
        expect(component.formatOrgRolePreview('Financeiro')).toBe('ORG_FINANCEIRO');
        expect(component.formatOrgRolePreview('ORG_VENDAS')).toBe('ORG_VENDAS');
    });

    it('deve criar organização, criar role ORG e compartilhar via Tenant', async () => {
        component.newOrgForm.organizatioName = 'CI Labs';
        await component.criarNovaOrganizacao();
        expect(orgApiSpy.criarOrganizacao).toHaveBeenCalled();

        component.newRoleForm.name = 'Financeiro';
        await component.criarRoleOrganizacao();
        expect(orgApiSpy.criarRole).toHaveBeenCalledWith('org-1', {
            name: 'Financeiro',
            description: undefined,
        });

        component.userSearchTerm = 'colega@ci.dev.br';
        component.shareSelectedRoles = ['ORG_FINANCEIRO'];
        await component.compartilharOrganizacao();
        expect(orgApiSpy.compartilharComUsuario).toHaveBeenCalledWith('org-1', {
            emailOrUsername: 'colega@ci.dev.br',
            roles: ['ORG_FINANCEIRO'],
        });
    });
});
