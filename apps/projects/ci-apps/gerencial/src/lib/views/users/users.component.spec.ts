import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { UserAuthenticationService } from '@ci/auth';
import { WindowService } from '@ci/components/window';
import { TenantService, UserService } from '@ci/portal-api';
import { BehaviorSubject, of } from 'rxjs';
import { UsersComponent } from './users.component';

describe('UsersComponent (/Gerencial/Painel/user-manager)', () => {
  let fixture: ComponentFixture<UsersComponent>;
  let component: UsersComponent;
  let userServiceSpy: any;
  let windowServiceSpy: any;
  let tenantServiceSpy: any;
  let authUser$: BehaviorSubject<any>;

  beforeEach(async () => {
    authUser$ = new BehaviorSubject<any>({
      id: 'admin-1',
      roles: ['USER', 'ADMIN'],
    });

    userServiceSpy = {
      getListByFilter: jasmine.createSpy('getListByFilter').and.returnValue(
        of([
          {
            id: 'user-1',
            fullName: 'Maria A',
            username: 'maria',
            email: 'maria@t1.com',
            roles: ['USER'],
            tenants: [{ id: 't-1', name: 'Tenant 1' }],
          },
          {
            id: 'master-1',
            fullName: 'Master',
            username: 'master',
            email: 'master@ci.dev.br',
            roles: ['USER', 'MASTER'],
            tenants: [{ id: 't-1', name: 'Tenant 1' }],
          },
        ]),
      ),
      addToTenant: jasmine.createSpy('addToTenant').and.returnValue(of({ id: 'user-2' })),
      removeFromTenant: jasmine.createSpy('removeFromTenant').and.returnValue(of({ id: 'user-1' })),
    };

    tenantServiceSpy = {
      listarTenantsDisponiveis: jasmine.createSpy('listarTenantsDisponiveis').and.returnValue(
        of([
          {
            id: 't-1',
            name: 'Tenant 1',
            permissionsSummary: {
              canVisualizar: true,
              canVer: true,
              canEditar: true,
              canCompartilhar: true,
            },
          },
        ]),
      ),
    };

    windowServiceSpy = {
      open: jasmine.createSpy('open').and.resolveTo(undefined),
    };

    await TestBed.configureTestingModule({
      imports: [UsersComponent, NoopAnimationsModule],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: TenantService, useValue: tenantServiceSpy },
        { provide: WindowService, useValue: windowServiceSpy },
        { provide: UserAuthenticationService, useValue: { user: authUser$ } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
    await component.ngOnInit();
  });

  it('deve carregar tenants disponíveis e impedir ADMIN de editar conta MASTER', () => {
    expect(component.isAdmin).toBeTrue();
    expect(component.isMaster).toBeFalse();
    expect(component.availableTenants.length).toBe(1);
    expect(component.users.length).toBe(2);

    const normalUser = component.users[0];
    const masterUser = component.users[1];
    expect(component.canEditUser(normalUser)).toBeTrue();
    expect(component.canEditUser(masterUser)).toBeFalse();
  });

  it('deve filtrar usuários ao alterar seleção de tenants', async () => {
    userServiceSpy.getListByFilter.calls.reset();
    await component.onTenantFilterChange(['t-1']);

    expect(userServiceSpy.getListByFilter).toHaveBeenCalledWith(
      jasmine.objectContaining({
        tenantIds: ['t-1'],
      }),
    );
  });

  it('deve vincular e desvincular usuário do tenant disponível', async () => {
    component.linkForm = {
      emailOrUsername: 'novo@t1.com',
      tenantId: 't-1',
      role: 'ADMIN',
    };
    await component.confirmLinkExistingUser();
    expect(userServiceSpy.addToTenant).toHaveBeenCalledWith({
      tenantId: 't-1',
      emailOrUsername: 'novo@t1.com',
      roles: ['USER', 'ADMIN'],
    });

    await component.removeFromTenant(component.users[0], { id: 't-1', name: 'Tenant 1' } as any);
    expect(userServiceSpy.removeFromTenant).toHaveBeenCalledWith({
      userId: 'user-1',
      tenantId: 't-1',
    });
  });
});
