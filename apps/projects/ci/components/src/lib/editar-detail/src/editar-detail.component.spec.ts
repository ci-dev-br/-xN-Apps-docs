import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { UserAuthenticationService } from '@ci/auth';
import { NavbarOrganizationAccessInfo, NavbarService } from '@ci/components';
import { WindowComponent, WindowModule } from '@ci/components/window';
import { CoreModule, DaoBuilder, DaoService, Handlers, WsService } from '@ci/core';
import { TenantService, TenantWithPermissionsDto } from '@ci/portal-api';
import { signal } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { EditarDetailComponent } from './editar-detail.component';
import { EditarDetailModule } from './editar-detail.module';

describe('EditarDetailComponent & WindowComponent - Menu agrupado mat-menu e transferência de Tenant', () => {
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
            name: 'Tenant Filial',
            descriptions: 'Somente leitura',
            organizacaoId: 'org-1',
            permissionsSummary: {
                canVisualizar: true,
                canVer: true,
                canEditar: false,
                canCompartilhar: false,
            },
        },
    ];

    let tenantSpy: jasmine.SpyObj<TenantService>;
    let mockSchemaService: { sync: jasmine.Spy; delete: jasmine.Spy };
    let wsSpy: jasmine.SpyObj<WsService>;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<WindowComponent>>;
    let orgAccessSignal = signal<NavbarOrganizationAccessInfo | null>(null);

    beforeEach(() => {
        orgAccessSignal = signal<NavbarOrganizationAccessInfo | null>({
            active: true,
            organizationId: 'org-1',
            organizationName: 'CI Labs',
            tenantId: 't-1',
            tenantName: 'Tenant Matriz',
            isOwner: true,
            roles: ['ORG_ADMIN'],
            organizations: [],
        });

        tenantSpy = jasmine.createSpyObj<TenantService>('TenantService', ['listarTenantsDisponiveis']);
        tenantSpy.listarTenantsDisponiveis.and.returnValue(of([...tenantsMock]));

        mockSchemaService = {
            sync: jasmine.createSpy('sync').and.callFake(({ body }: any) => of({ data: body?.data || {} })),
            delete: jasmine.createSpy('delete').and.returnValue(of({})),
        };

        wsSpy = jasmine.createSpyObj<WsService>('WsService', ['Propagar']);
        dialogRefSpy = jasmine.createSpyObj<MatDialogRef<WindowComponent>>('MatDialogRef', ['close']);
    });

    async function createWindowWithEditor(recordData: any): Promise<{
        fixture: ComponentFixture<WindowComponent>;
        windowComp: WindowComponent;
        editorComp: EditarDetailComponent;
    }> {
        await TestBed.configureTestingModule({
            imports: [WindowModule, EditarDetailModule, NoopAnimationsModule, CoreModule],
            providers: [
                {
                    provide: DaoBuilder,
                    useValue: {
                        getSchema: jasmine.createSpy('getSchema').and.resolveTo({
                            type: 'object',
                            properties: {
                                nome: { type: 'string', title: 'Nome' },
                                tenants: { type: 'array', isArray: true },
                            },
                        }),
                        getForm: jasmine.createSpy('getForm').and.resolveTo(undefined),
                    },
                },
                {
                    provide: DaoService,
                    useValue: {
                        prepareToEdit: jasmine.createSpy('prepareToEdit').and.resolveTo(recordData),
                        confirmation: jasmine.createSpy('confirmation').and.returnValue(undefined),
                        getChanges: jasmine.createSpy('getChanges').and.returnValue({}),
                        haveChanges: jasmine.createSpy('haveChanges').and.returnValue(false),
                        sanitizeDeep: jasmine.createSpy('sanitizeDeep').and.callFake((v: any) => JSON.parse(JSON.stringify(v))),
                        bindDataForm: jasmine.createSpy('bindDataForm'),
                        confirmChanges: jasmine.createSpy('confirmChanges').and.resolveTo(),
                    },
                },
                { provide: ActivatedRoute, useValue: { data: of({}), params: of({}), queryParams: of({}) } },
                { provide: TenantService, useValue: tenantSpy },
                { provide: NavbarService, useValue: { organizationAccess: orgAccessSignal } },
                {
                    provide: UserAuthenticationService,
                    useValue: { user: new BehaviorSubject({ id: 'u-1', tenants: [tenantsMock[0]] }) },
                },
                { provide: WsService, useValue: wsSpy },
                { provide: Handlers, useValue: { getHandler: () => undefined, registryHandler: () => {} } },
                { provide: MatDialogRef, useValue: dialogRefSpy },
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: {
                        component: EditarDetailComponent,
                        data: {
                            schemaName: 'Pessoa',
                            data: recordData,
                            service: mockSchemaService,
                            availableTenants: tenantsMock,
                            organizacaoId: 'org-1',
                        },
                    },
                },
            ],
        }).compileComponents();

        const fixture = TestBed.createComponent(WindowComponent);
        const windowComp = fixture.componentInstance;
        windowComp.title = 'Pessoa';
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const editorDebug = fixture.debugElement.children.find(
            el => el.componentInstance instanceof EditarDetailComponent,
        ) || fixture.debugElement.query(el => el.componentInstance instanceof EditarDetailComponent);
        const editorComp = editorDebug.componentInstance as EditarDetailComponent;

        return { fixture, windowComp, editorComp };
    }

    it('deve renderizar menu agrupado com mat-menu na janela, transferir objeto do usuário para tenant proprietário e marcar objeto', async () => {
        const record: any = {
            internalId: 'obj-1',
            nome: 'João Silva',
            tenants: [],
        };

        const { fixture, windowComp, editorComp } = await createWindowWithEditor(record);

        // Inicialmente o objeto pertence apenas ao usuário (sem tenant proprietário)
        expect(editorComp.hasOwnerTenant).toBeFalse();
        const statusBarInitial = fixture.nativeElement.querySelector('.editar-tenant-status-bar');
        expect(statusBarInitial).not.toBeNull();
        expect(statusBarInitial.classList.contains('user-owned')).toBeTrue();
        expect(statusBarInitial.textContent).toContain('Objeto do usuário');

        // Deve existir botão disparador do menu agrupado na toolbar da Window
        const triggerBtn: HTMLButtonElement | null = fixture.nativeElement.querySelector('.ci-window--grouped-menu-trigger');
        expect(triggerBtn).not.toBeNull();

        // Abre o mat-menu agrupado na janela
        triggerBtn!.click();
        fixture.detectChanges();
        await fixture.whenStable();

        const menuItems = Array.from(document.querySelectorAll('.cdk-overlay-container [mat-menu-item]')) as HTMLElement[];
        const transferMenuItem = menuItems.find(el => el.textContent?.includes('Transferir para Tenant Proprietário'));
        const removeMenuItem = menuItems.find(el => el.textContent?.includes('Remover Registro'));
        expect(transferMenuItem).toBeDefined();
        expect(removeMenuItem).toBeDefined();

        // Abre o submenu agrupado de seleção de tenant proprietário
        transferMenuItem!.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        transferMenuItem!.click();
        fixture.detectChanges();
        await fixture.whenStable();

        const subItems = Array.from(document.querySelectorAll('.cdk-overlay-container .ci-window--grouped-submenu [mat-menu-item]')) as HTMLButtonElement[];
        const matrizBtn = subItems.find(el => el.textContent?.includes('Tenant Matriz'));
        const filialBtn = subItems.find(el => el.textContent?.includes('Tenant Filial'));
        expect(matrizBtn).toBeDefined();
        expect(filialBtn).toBeDefined();
        expect(filialBtn!.disabled).toBeTrue();

        // Transfere o objeto do usuário para o Tenant Matriz
        matrizBtn!.click();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(mockSchemaService.sync).toHaveBeenCalledWith({
            body: {
                data: {
                    internalId: 'obj-1',
                    tenants: [{ id: 't-1' }],
                },
            },
        });
        expect(editorComp.hasOwnerTenant).toBeTrue();
        expect(editorComp.isOwnedByTenant('t-1')).toBeTrue();
        expect(windowComp.isItemChecked(windowComp.acts.value?.[0]?.children?.[0])).toBeTrue();

        const statusBarOwned = fixture.nativeElement.querySelector('.editar-tenant-status-bar');
        expect(statusBarOwned.classList.contains('tenant-owned')).toBeTrue();
        expect(statusBarOwned.textContent).toContain('Pertence ao Tenant:');
        expect(statusBarOwned.textContent).toContain('Tenant Matriz');

        // Devolve a propriedade para o usuário
        const transferred = await editorComp.transferToTenant(null);
        expect(transferred).toBeTrue();
        fixture.detectChanges();

        expect(mockSchemaService.sync).toHaveBeenCalledWith({
            body: {
                data: {
                    internalId: 'obj-1',
                    tenants: [],
                },
            },
        });
        expect(editorComp.hasOwnerTenant).toBeFalse();
        expect(fixture.nativeElement.querySelector('.editar-tenant-status-bar.user-owned')).not.toBeNull();
    });
});
