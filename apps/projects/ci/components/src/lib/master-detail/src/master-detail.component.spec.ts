import { Injector, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { NavbarOrganizationAccessInfo, NavbarService } from '@ci/components';
import { WindowService } from '@ci/components/window';
import { CoreModule, DaoBuilder, DaoService, Handlers } from '@ci/core';
import { TenantService, TenantWithPermissionsDto } from '@ci/portal-api';
import { of } from 'rxjs';
import { MasterDetailComponent } from './master-detail.component';
import { MasterDetailModule } from './master-detail.module';

describe('MasterDetailComponent - Filtro, Edição, Criação e Permissões de Tenants por Organização', () => {
    let fixture: ComponentFixture<MasterDetailComponent>;
    let component: MasterDetailComponent;
    let orgAccessSignal = signal<NavbarOrganizationAccessInfo | null>(null);
    let tenantSpy: jasmine.SpyObj<TenantService>;
    let mockSchemaService: { getList: jasmine.Spy; sync: jasmine.Spy };

    const tenantsMock: TenantWithPermissionsDto[] = [
        {
            id: 't-1',
            name: 'Tenant Matriz',
            descriptions: 'Unidade principal',
            organizacaoId: 'org-1',
            permissionsSummary: {
                canVisualizar: true,
                canVer: true,
                canEditar: true,
                canCompartilhar: true,
            },
        },
        {
            id: 't-2',
            name: 'Tenant Leitura',
            descriptions: 'Somente visualização',
            organizacaoId: 'org-1',
            permissionsSummary: {
                canVisualizar: true,
                canVer: true,
                canEditar: false,
                canCompartilhar: false,
            },
        },
    ];

    beforeEach(async () => {
        orgAccessSignal = signal<NavbarOrganizationAccessInfo | null>(null);
        tenantSpy = jasmine.createSpyObj<TenantService>('TenantService', [
            'listarTenantsDisponiveis',
            'criarTenant',
            'atualizarTenant',
            'listarPermissoesTenant',
            'definirPermissaoTenant',
            'removerPermissaoTenant',
        ]);
        tenantSpy.listarTenantsDisponiveis.and.callFake(() => of([...tenantsMock]));
        tenantSpy.criarTenant.and.callFake((payload: any) =>
            of({
                id: 't-3',
                name: payload.name,
                descriptions: payload.descriptions,
                organizacaoId: payload.organizacaoId,
                permissionsSummary: {
                    canVisualizar: true,
                    canVer: true,
                    canEditar: true,
                    canCompartilhar: true,
                    ...(payload.permissions || {}),
                },
            }),
        );
        tenantSpy.atualizarTenant.and.callFake((id: string, payload: any) =>
            of({
                id,
                name: payload.name,
                descriptions: payload.descriptions,
                organizacaoId: payload.organizacaoId,
                permissionsSummary: tenantsMock[0].permissionsSummary,
            }),
        );
        tenantSpy.listarPermissoesTenant.and.returnValue(
            of([
                {
                    id: 'perm-1',
                    tenantId: 't-1',
                    userId: 'u-1',
                    canVisualizar: true,
                    canVer: true,
                    canEditar: true,
                    canCompartilhar: true,
                },
            ]),
        );
        tenantSpy.definirPermissaoTenant.and.callFake((tenantId: string, payload: any) =>
            of({
                id: 'perm-2',
                tenantId,
                userId: 'u-2',
                canVisualizar: Boolean(payload.canVisualizar),
                canVer: Boolean(payload.canVer),
                canEditar: Boolean(payload.canEditar),
                canCompartilhar: Boolean(payload.canCompartilhar),
            }),
        );
        tenantSpy.removerPermissaoTenant.and.returnValue(of({ removed: true }));

        mockSchemaService = {
            getList: jasmine.createSpy('getList').and.callFake(({ body }: any) => {
                const allRows = [
                    { internalId: 'r-1', nome: 'Registro Matriz', tenants: [{ id: 't-1' }] },
                    { internalId: 'r-2', nome: 'Registro Leitura', tenants: [{ id: 't-2' }] },
                ];
                if (Array.isArray(body?.tenantIds) && body.tenantIds.length > 0) {
                    const set = new Set(body.tenantIds);
                    return of(allRows.filter(r => r.tenants.some(t => set.has(t.id))));
                }
                return of(allRows);
            }),
            sync: jasmine.createSpy('sync').and.callFake(({ body }: any) => of({ data: body?.data || {} })),
        };

        await TestBed.configureTestingModule({
            imports: [MasterDetailModule, NoopAnimationsModule, CoreModule],
            providers: [
                {
                    provide: DaoBuilder,
                    useValue: {
                        getSchema: jasmine.createSpy('getSchema').and.resolveTo({
                            type: 'object',
                            properties: {
                                nome: { type: 'string', title: 'Nome' },
                            },
                        }),
                    },
                },
                {
                    provide: DaoService,
                    useValue: {
                        read: jasmine.createSpy('read').and.callFake(async (data: any) => data),
                    },
                },
                { provide: ActivatedRoute, useValue: { data: of({}), params: of({}), queryParams: of({}) } },
                { provide: WindowService, useValue: jasmine.createSpyObj<WindowService>('WindowService', ['open']) },
                { provide: NavbarService, useValue: { organizationAccess: orgAccessSignal } },
                { provide: TenantService, useValue: tenantSpy },
                { provide: Handlers, useValue: { getHandler: () => undefined, registryHandler: () => {} } },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(MasterDetailComponent);
        component = fixture.componentInstance;
        component.schemaName = 'MockEntity';
        component.service = mockSchemaService;
    });

    it('não deve exibir o filtro de tenants quando nenhuma organização estiver selecionada', async () => {
        fixture.detectChanges();
        await fixture.whenStable();

        expect(component.isOrganizationSelected).toBeFalse();
        expect(fixture.nativeElement.querySelector('.org-tenant-filter-bar')).toBeNull();
    });

    it('deve habilitar o filtro com tenants disponíveis ao selecionar organização, filtrar registros, mostrar/editar/criar tenants e gerenciar permissões', async () => {
        orgAccessSignal.set({
            active: true,
            organizationId: 'org-1',
            organizationName: 'CI Labs',
            tenantId: 't-1',
            tenantName: 'Tenant Matriz',
            isOwner: true,
            roles: ['ORG_ADMIN'],
            organizations: [],
        });

        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(component.isOrganizationSelected).toBeTrue();
        expect(tenantSpy.listarTenantsDisponiveis).toHaveBeenCalledWith('org-1');
        expect(component.availableTenants.length).toBe(2);
        expect(fixture.nativeElement.querySelector('.org-tenant-filter-bar')).not.toBeNull();

        // Seleciona tenant t-1 no filtro
        component.onSelectedTenantsChange(['t-1']);
        await fixture.whenStable();
        fixture.detectChanges();

        expect(mockSchemaService.getList).toHaveBeenCalledWith(
            jasmine.objectContaining({
                body: jasmine.objectContaining({
                    tenantIds: ['t-1'],
                }),
            }),
        );
        expect(component.source.length).toBe(1);
        expect((component.source[0] as any).nome).toBe('Registro Matriz');
        expect(fixture.nativeElement.querySelector('.selected-tenant-card')?.textContent).toContain('Tenant Matriz');
        expect(fixture.nativeElement.querySelector('.selected-tenant-card')?.textContent).toContain('Compartilhar');

        // Edita tenant selecionado
        component.startEditSelectedTenant();
        component.editTenantForm.name = 'Tenant Matriz Editado';
        component.editTenantForm.descriptions = 'Descrição atualizada';
        await component.saveEditedTenant();

        expect(tenantSpy.atualizarTenant).toHaveBeenCalledWith(
            't-1',
            jasmine.objectContaining({
                name: 'Tenant Matriz Editado',
                descriptions: 'Descrição atualizada',
                organizacaoId: 'org-1',
            }),
        );

        // Gerencia permissões do tenant selecionado (visualizar, ver, editar, compartilhar)
        await component.openTenantPermissionsPanel();
        expect(tenantSpy.listarPermissoesTenant).toHaveBeenCalledWith('t-1');
        component.newPermissionForm.emailOrUsername = 'colega@ci.dev.br';
        component.newPermissionForm.canVisualizar = true;
        component.newPermissionForm.canVer = true;
        component.newPermissionForm.canEditar = true;
        component.newPermissionForm.canCompartilhar = false;
        await component.saveTenantPermission();

        expect(tenantSpy.definirPermissaoTenant).toHaveBeenCalledWith(
            't-1',
            jasmine.objectContaining({
                emailOrUsername: 'colega@ci.dev.br',
                canVisualizar: true,
                canVer: true,
                canEditar: true,
                canCompartilhar: false,
            }),
        );

        // Cria novo tenant na organização selecionada
        component.startCreateTenant();
        component.newTenantForm.name = 'Tenant Filial';
        component.newTenantForm.descriptions = 'Filial SP';
        component.newTenantForm.permissions = {
            canVisualizar: true,
            canVer: true,
            canEditar: true,
            canCompartilhar: false,
        };
        const created = await component.createTenant();

        expect(created?.id).toBe('t-3');
        expect(tenantSpy.criarTenant).toHaveBeenCalledWith(
            jasmine.objectContaining({
                name: 'Tenant Filial',
                descriptions: 'Filial SP',
                organizacaoId: 'org-1',
                permissions: {
                    canVisualizar: true,
                    canVer: true,
                    canEditar: true,
                    canCompartilhar: false,
                },
            }),
        );
    });

    it('deve marcar objetos que pertencem a um tenant específico nas visões tabela, lista e miniaturas e repassar tenants ao EditarDetailComponent', async () => {
        orgAccessSignal.set({
            active: true,
            organizationId: 'org-1',
            organizationName: 'CI Labs',
            tenantId: 't-1',
            tenantName: 'Tenant Matriz',
            isOwner: true,
            roles: ['ORG_ADMIN'],
            organizations: [],
        });

        mockSchemaService.getList.and.returnValue(
            of([
                { internalId: 'r-tenant', nome: 'Objeto do Tenant', tenants: [{ id: 't-1' }] },
                { internalId: 'r-user', nome: 'Objeto Pessoal', tenants: [] },
            ]),
        );

        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        // Visão em tabela: marca linha com classe --tenant-owned e inclui coluna Tenant Proprietário
        const tableRows = Array.from(fixture.nativeElement.querySelectorAll('tr.mat-mdc-row')) as HTMLElement[];
        expect(tableRows.length).toBe(2);
        expect(tableRows[0].classList.contains('--tenant-owned')).toBeTrue();
        expect(tableRows[1].classList.contains('--tenant-owned')).toBeFalse();
        expect(tableRows[0].textContent).toContain('Tenant Matriz');

        // Visão em lista: marca card com .tenant-owned-item e badge do tenant
        component.visualizacao = 'list';
        fixture.detectChanges();
        const listCards = Array.from(fixture.nativeElement.querySelectorAll('.list-row-card')) as HTMLElement[];
        expect(listCards.length).toBe(2);
        expect(listCards[0].classList.contains('tenant-owned-item')).toBeTrue();
        expect(listCards[0].querySelector('.tenant-owner-badge')?.textContent).toContain('Tenant Matriz');
        expect(listCards[1].classList.contains('tenant-owned-item')).toBeFalse();
        expect(listCards[1].querySelector('.tenant-owner-badge')).toBeNull();

        // Visão em miniaturas: marca card com .tenant-owned-item e badge do tenant
        component.visualizacao = 'thumbnails';
        fixture.detectChanges();
        const thumbCards = Array.from(fixture.nativeElement.querySelectorAll('.thumbnail-card')) as HTMLElement[];
        expect(thumbCards.length).toBe(2);
        expect(thumbCards[0].classList.contains('tenant-owned-item')).toBeTrue();
        expect(thumbCards[0].querySelector('.tenant-owner-badge')?.textContent).toContain('Tenant Matriz');
        expect(thumbCards[1].classList.contains('tenant-owned-item')).toBeFalse();

        // Ao abrir edição, repassa availableTenants e organizacaoId
        const windowSpy = TestBed.inject(WindowService) as jasmine.SpyObj<WindowService>;
        windowSpy.open.and.resolveTo(undefined);
        await component.editar(component.source[0]);

        expect(windowSpy.open).toHaveBeenCalledWith(
            jasmine.any(Function),
            jasmine.objectContaining({
                schemaName: 'MockEntity',
                availableTenants: jasmine.arrayContaining([
                    jasmine.objectContaining({ id: 't-1', name: 'Tenant Matriz' }),
                ]),
                organizacaoId: 'org-1',
            }),
            'MockEntity',
            undefined,
        );
    });
});
