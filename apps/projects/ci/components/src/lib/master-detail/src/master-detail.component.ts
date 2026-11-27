import { AfterViewInit, Component, effect, Injector, Input, OnChanges, OnDestroy, OnInit, Optional, SimpleChanges } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ActionsService } from "@ci/components/action";
import { GridBuilder, IColumnOption } from "@ci/components/data-grid";
import { EditarDetailComponent } from "@ci/components/editar-detail";
import { NavbarService } from "@ci/components";
import { WindowService } from "@ci/components/window";
import { DaoBuilder, DaoService, IAmSchematization, ISchema, ISchemaProperty } from "@ci/core";
import {
    getServiceAsSchema,
    TenantPermissionFlagsDto,
    TenantPermissionItemDto,
    TenantService,
    TenantWithPermissionsDto,
} from "@ci/portal-api";
import { lastValueFrom } from "rxjs";

export interface ISchemaFieldMeta {
    key: string;
    title: string;
    type: string;
    format?: string;
    enum?: any[];
    isRelation?: boolean;
    prop: ISchemaProperty;
}

const HIDDEN_AUDIT_FIELDS = [
    'internalId',
    'id',
    'createdAt',
    'createdBy',
    'lastModifiedAt',
    'lastModifiedBy',
    'tenants',
    'deleted',
];

/**
 *  # Componente de Master-Detail para exibição e edição de dados.
 *
 * Este componente oferece uma interface para visualizar e gerenciar dados de uma entidade (schema).
 * Ele consome o schema da entidade através de `DaoBuilder` e `DaoService` (`@ci/core`) e permite alternar
 * entre as visões de tabela (`table` / DataGrid), lista (`list`) e miniaturas (`thumbnails`), além de
 * disponibilizar filtragem por propriedades do schema e busca textual.
 */
@Component({
    selector: 'ci-master-detail',
    standalone: false,
    styleUrl: 'master-detail.component.scss',
    templateUrl: 'master-detail.component.html'
})
export class MasterDetailComponent<T = any> implements OnInit, AfterViewInit, OnChanges, OnDestroy, IAmSchematization {
    searchDefault?: any;
    @Input()
    visualizacao: 'table' | 'list' | 'thumbnails' = 'table';
    @Input()
    schemaName?: string;
    @Input()
    gridOptions?: { columns: IColumnOption<any>[] };
    @Input()
    organizacaoId?: string;

    // Estado do filtro e gestão de Tenants quando uma Organização está selecionada
    availableTenants: TenantWithPermissionsDto[] = [];
    selectedTenantIds: string[] = [];
    loadingTenants = false;
    tenantPanelMode: 'none' | 'create' | 'edit' | 'permissions' = 'none';
    tenantActionBusy = false;
    tenantActionFeedback?: string;
    tenantActionError?: string;
    newTenantForm: {
        name: string;
        descriptions: string;
        permissions: TenantPermissionFlagsDto;
    } = {
        name: '',
        descriptions: '',
        permissions: {
            canVisualizar: true,
            canVer: true,
            canEditar: true,
            canCompartilhar: true,
        },
    };
    editTenantForm: {
        name: string;
        descriptions: string;
    } = {
        name: '',
        descriptions: '',
    };
    tenantPermissionsList: TenantPermissionItemDto[] = [];
    newPermissionForm: {
        emailOrUsername: string;
        role: string;
        canVisualizar: boolean;
        canVer: boolean;
        canEditar: boolean;
        canCompartilhar: boolean;
    } = {
        emailOrUsername: '',
        role: '',
        canVisualizar: true,
        canVer: true,
        canEditar: false,
        canCompartilhar: false,
    };
    private lastLoadedOrgId?: string;

    service?: any;
    schema?: ISchema;
    schemaProperties: { [key: string]: ISchemaProperty } = {};
    visibleFields: ISchemaFieldMeta[] = [];
    filterableFields: ISchemaFieldMeta[] = [];

    source: T[] = [];
    allSource: T[] = [];
    loading = false;

    showColumnFilters = true;
    columnFilters: Record<string, any> = {};
    searchText = '';
    private searchDebounceTimer?: any;
    private order?: Record<string, 'ASC' | 'DESC'>;
    private oTitle?: string;
    acoes = [
        { type: 'raised', label: 'Pesquisar', icon: 'refresh', onClick: (event: Event) => this.search(), tooltip: 'Atualizar Lista' },
        { type: 'flat', label: 'Cadastrar', icon: 'add', onClick: (event: Event) => this.createNew(), tooltip: 'Inserir novo cadastro' },
        { type: 'stroked', label: 'Filtros', icon: 'filter_alt', onClick: (event: Event) => (this.showColumnFilters = !this.showColumnFilters), active: () => (this.showColumnFilters || this.activeFilterCount > 0), badge: () => (this.activeFilterCount > 0 ? this.activeFilterCount : undefined), tooltip: '', class: 'filter-toggle-btn' },
    ];
    constructor(
        @Optional() private daoBuilder?: DaoBuilder,
        @Optional() private daos?: DaoService,
        @Optional() private route?: ActivatedRoute,
        @Optional() private window?: WindowService,
        @Optional() private injector?: Injector,
        @Optional() private gridb?: GridBuilder,
        @Optional() private actions?: ActionsService,
        @Optional() private navbarService?: NavbarService,
        @Optional() private tenantService?: TenantService,
    ) {
        if (this.navbarService?.organizationAccess) {
            effect(() => {
                const access = this.navbarService?.organizationAccess();
                const orgId = this.organizacaoId || access?.organizationId;
                if (orgId && orgId !== this.lastLoadedOrgId) {
                    this.loadAvailableTenants(orgId);
                } else if (!orgId && this.lastLoadedOrgId) {
                    this.resetTenantSelectionState();
                }
            });
        }
    }

    get activeOrganizationId(): string | undefined {
        return this.organizacaoId || this.navbarService?.organizationAccess()?.organizationId || undefined;
    }

    get activeOrganizationName(): string | undefined {
        return this.navbarService?.organizationAccess()?.organizationName || undefined;
    }

    get isOrganizationSelected(): boolean {
        return Boolean(this.activeOrganizationId);
    }

    get selectedTenants(): TenantWithPermissionsDto[] {
        const set = new Set(this.selectedTenantIds || []);
        return (this.availableTenants || []).filter(t => set.has(t.id));
    }

    get primarySelectedTenant(): TenantWithPermissionsDto | undefined {
        return this.selectedTenants[0];
    }

    get activeFilterCount(): number {
        const colCount = Object.keys(this.columnFilters || {}).filter(k => {
            const v = this.columnFilters[k];
            return v !== undefined && v !== null && String(v).trim() !== '';
        }).length;
        return colCount + (this.selectedTenantIds?.length || 0);
    }

    async ngOnChanges(changes: SimpleChanges) {
        if (changes['schemaName'] && !changes['schemaName'].firstChange && this.schemaName) {
            await this.prepareSchema();
        }
        if (changes['organizacaoId']) {
            const orgId = this.activeOrganizationId;
            if (orgId) {
                await this.loadAvailableTenants(orgId);
            } else {
                this.resetTenantSelectionState();
            }
        }
    }

    async loadGrid() {
        if (!this.schemaName) return;

        const daoBuilder = this.daoBuilder || this.injector?.get(DaoBuilder, null);
        const daos = this.daos || this.injector?.get(DaoService, null);
        const gridb = this.gridb || this.injector?.get(GridBuilder, null);

        if (daoBuilder || daos) {
            this.schema = await (daoBuilder ? daoBuilder.getSchema(this.schemaName) : daos!.getSchema(this.schemaName));
            this.schemaProperties = this.schema?.properties || {};

            this.visibleFields = Object.keys(this.schemaProperties)
                .filter(key => !HIDDEN_AUDIT_FIELDS.includes(key))
                .map(key => {
                    const prop = this.schemaProperties[key];
                    const isRelation = Boolean(
                        prop.$ref ||
                        (prop.items as any)?.$ref ||
                        (prop.type === 'object' && prop.format !== 'json')
                    );
                    const normalizedType =
                        prop?.type === 'boolean'
                            ? 'boolean'
                            : prop?.format === 'date-time' || prop?.format === 'datetime'
                                ? 'date-time'
                                : prop?.format === 'date' || prop?.type === 'date'
                                    ? 'date'
                                    : prop?.type || 'string';
                    return {
                        key,
                        title: prop?.title || key,
                        type: normalizedType,
                        format: prop?.format,
                        enum: prop?.enum || (prop?.items as any)?.enum,
                        isRelation,
                        prop,
                    };
                });

            this.filterableFields = this.visibleFields.filter(f => !f.isRelation);

            if (gridb) {
                this.gridOptions = await gridb.FromSchema(this.schemaName);
            } else {
                this.gridOptions = {
                    columns: this.visibleFields.map(f => ({
                        headerName: f.title,
                        fieldName: f.key,
                        type: f.type,
                        format: f.format,
                        schemaProperty: f.prop,
                        hide: false,
                    }))
                };
            }
            this.ensureTenantColumnInGrid();
        } else {
            this.gridOptions = { columns: [] };
        }
    }

    private ensureFieldsFromData(items: T[]) {
        if (!items || items.length === 0) return;
        if (this.visibleFields.length > 0 && (this.gridOptions?.columns?.filter(c => !c.hide)?.length || 0) > 0) {
            return;
        }
        const keySet = new Set<string>();
        items.slice(0, 10).forEach((item: any) => {
            if (item && typeof item === 'object') {
                Object.keys(item).forEach(k => {
                    if (!HIDDEN_AUDIT_FIELDS.includes(k) && !k.startsWith('_') && !k.startsWith(':') && k !== 'toJSON' && k !== 'toString') {
                        keySet.add(k);
                    }
                });
            }
        });

        if (keySet.size === 0) return;

        this.visibleFields = Array.from(keySet).map(key => {
            const sampleVal = (items.find((it: any) => it?.[key] !== undefined && it?.[key] !== null) as any)?.[key];
            const isRelation = Array.isArray(sampleVal) || (typeof sampleVal === 'object' && sampleVal !== null);
            const inferredType = typeof sampleVal === 'number' ? 'number' : typeof sampleVal === 'boolean' ? 'boolean' : isRelation ? 'object' : 'string';
            const prop: ISchemaProperty = this.schemaProperties?.[key] || {
                title: key,
                type: inferredType,
            };
            return {
                key,
                title: prop.title || key,
                type: prop.type || inferredType,
                format: prop.format,
                enum: prop.enum,
                isRelation,
                prop,
            };
        });

        this.filterableFields = this.visibleFields.filter(f => !f.isRelation);
        this.gridOptions = {
            columns: this.visibleFields.map(f => ({
                headerName: f.title,
                fieldName: f.key,
                type: f.type,
                format: f.format,
                schemaProperty: f.prop,
                hide: false,
            }))
        };
    }

    async ngAfterViewInit() {
        if (!!this.schemaName && (!this.gridOptions || this.visibleFields.length === 0)) {
            await this.prepareSchema();
        }
    }

    ngOnDestroy(): void {
        if (!!document && this.oTitle) document.title = this.oTitle;
        if (this.searchDebounceTimer) clearTimeout(this.searchDebounceTimer);
    }

    async ngOnInit() {
        this.actions?.setAction('confirmation', {
            label: 'Confirmar alterações',
            icon: 'done-all',
            onClick: (element) => {
                element;
            }
        });
        this.route?.data.subscribe(async (data: any) => {
            if (!!data.schema) {
                this.schemaName = data.schema;
                this.searchDefault = data.search;
                await this.prepareSchema();
            }
        });
        this.route?.params.subscribe(async (params: any) => {
            if (!!params.EntityName && typeof params.EntityName === 'string') {
                this.schemaName = params.EntityName;
                await this.prepareSchema();
            }
        });
        this.route?.queryParams.subscribe((queries: any) => {
            if (queries.Editar) {
                // reservado para abertura direta de edição via query param
            }
        });
        if (this.activeOrganizationId) {
            await this.loadAvailableTenants(this.activeOrganizationId);
        }
    }

    async prepareSchema() {
        try {
            this.columnFilters = {};
            this.searchText = '';
            this.order = undefined;
            this.source = [];
            this.allSource = [];

            if (this.schemaName && !!document?.title) {
                if (!this.oTitle) this.oTitle = document.title;
                document.title = `${this.oTitle} - ${this.schemaName}`;
            }

            await this.loadGrid();

            if (!!this.schemaName) {
                const serviceType = getServiceAsSchema(this.schemaName);
                const resolved = serviceType ? this.injector?.get(serviceType, null) : undefined;
                if (resolved) {
                    this.service = resolved;
                }
            }

            await this.search();
        } catch (error) {
            console.trace(error);
        }
    }

    onSearchTextChange(value: string, immediate = false) {
        this.searchText = value;
        if (this.searchDebounceTimer) clearTimeout(this.searchDebounceTimer);
        if (immediate) {
            this.search();
        } else {
            this.searchDebounceTimer = setTimeout(() => {
                this.search();
            }, 300);
        }
    }

    onFilterChange(filters: Record<string, any>) {
        this.columnFilters = { ...(filters || {}) };
        this.search();
    }

    onSingleFilterChange(key: string, value: any, immediate = false) {
        const next = { ...(this.columnFilters || {}) };
        if (value === undefined || value === null || String(value).trim() === '') {
            delete next[key];
        } else {
            next[key] = value;
        }
        this.columnFilters = next;
        if (this.searchDebounceTimer) clearTimeout(this.searchDebounceTimer);
        if (immediate) {
            this.search();
        } else {
            this.searchDebounceTimer = setTimeout(() => {
                this.search();
            }, 300);
        }
    }

    clearAllFilters() {
        this.columnFilters = {};
        this.searchText = '';
        this.selectedTenantIds = [];
        this.tenantPanelMode = 'none';
        this.search();
    }

    onSelectedTenantsChange(tenantIds: string[]): void {
        this.selectedTenantIds = Array.isArray(tenantIds) ? tenantIds.filter(Boolean) : [];
        this.tenantActionFeedback = undefined;
        this.tenantActionError = undefined;

        const primary = this.primarySelectedTenant;
        if (!primary) {
            if (this.tenantPanelMode === 'edit' || this.tenantPanelMode === 'permissions') {
                this.tenantPanelMode = 'none';
            }
            this.tenantPermissionsList = [];
        } else {
            if (this.tenantPanelMode === 'edit') {
                this.editTenantForm = {
                    name: primary.name || '',
                    descriptions: primary.descriptions || '',
                };
            } else if (this.tenantPanelMode === 'permissions') {
                this.loadTenantPermissions(primary.id);
            }
        }

        this.search();
    }

    private resetTenantSelectionState(): void {
        this.lastLoadedOrgId = undefined;
        this.availableTenants = [];
        this.selectedTenantIds = [];
        this.tenantPanelMode = 'none';
        this.tenantPermissionsList = [];
        this.tenantActionFeedback = undefined;
        this.tenantActionError = undefined;
    }

    async loadAvailableTenants(orgId?: string): Promise<TenantWithPermissionsDto[]> {
        const targetOrgId = orgId || this.activeOrganizationId;
        if (!targetOrgId) {
            this.resetTenantSelectionState();
            return [];
        }

        this.lastLoadedOrgId = targetOrgId;
        this.loadingTenants = true;
        this.tenantActionError = undefined;

        try {
            let loaded: TenantWithPermissionsDto[] = [];
            if (this.tenantService && typeof this.tenantService.listarTenantsDisponiveis === 'function') {
                loaded = (await lastValueFrom(this.tenantService.listarTenantsDisponiveis(targetOrgId))) || [];
            }

            if (loaded.length === 0) {
                const access = this.navbarService?.organizationAccess?.();
                if (access?.tenantId && (!this.organizacaoId || access.organizationId === targetOrgId)) {
                    loaded = [{
                        id: access.tenantId,
                        name: access.tenantName || `ORG: ${access.organizationName || 'Organização'}`,
                        organizacaoId: targetOrgId,
                        permissionsSummary: {
                            canVisualizar: true,
                            canVer: true,
                            canEditar: Boolean(access.isOwner || access.roles?.includes('ORG_ADMIN')),
                            canCompartilhar: Boolean(access.isOwner || access.roles?.includes('ORG_ADMIN')),
                        },
                    }];
                }
            }

            this.availableTenants = loaded.filter(
                t => t.permissionsSummary?.canVisualizar !== false || t.permissionsSummary?.canVer !== false,
            );

            const validIds = new Set(this.availableTenants.map(t => t.id));
            this.selectedTenantIds = this.selectedTenantIds.filter(id => validIds.has(id));
            this.hydrateItemsTenants(this.allSource);
            return this.availableTenants;
        } catch (err: any) {
            this.tenantActionError = err?.error?.message || err?.message || 'Erro ao carregar tenants disponíveis.';
            return [];
        } finally {
            this.loadingTenants = false;
        }
    }

    startCreateTenant(): void {
        this.tenantActionFeedback = undefined;
        this.tenantActionError = undefined;
        this.newTenantForm = {
            name: '',
            descriptions: '',
            permissions: {
                canVisualizar: true,
                canVer: true,
                canEditar: true,
                canCompartilhar: true,
            },
        };
        this.tenantPanelMode = this.tenantPanelMode === 'create' ? 'none' : 'create';
    }

    startEditSelectedTenant(): void {
        const selected = this.primarySelectedTenant;
        if (!selected) return;
        this.tenantActionFeedback = undefined;
        this.tenantActionError = undefined;
        this.editTenantForm = {
            name: selected.name || '',
            descriptions: selected.descriptions || '',
        };
        this.tenantPanelMode = this.tenantPanelMode === 'edit' ? 'none' : 'edit';
    }

    async openTenantPermissionsPanel(): Promise<void> {
        const selected = this.primarySelectedTenant;
        if (!selected) return;
        this.tenantActionFeedback = undefined;
        this.tenantActionError = undefined;
        this.tenantPanelMode = this.tenantPanelMode === 'permissions' ? 'none' : 'permissions';
        if (this.tenantPanelMode === 'permissions') {
            await this.loadTenantPermissions(selected.id);
        }
    }

    async createTenant(): Promise<TenantWithPermissionsDto | null> {
        const orgId = this.activeOrganizationId;
        const cleanName = (this.newTenantForm.name || '').trim();
        if (!orgId) {
            this.tenantActionError = 'Selecione uma organização antes de criar um tenant.';
            return null;
        }
        if (!cleanName) {
            this.tenantActionError = 'Informe o nome do novo tenant.';
            return null;
        }
        if (!this.tenantService || typeof this.tenantService.criarTenant !== 'function') {
            this.tenantActionError = 'Serviço de Tenant indisponível.';
            return null;
        }

        this.tenantActionBusy = true;
        this.tenantActionError = undefined;
        this.tenantActionFeedback = undefined;

        try {
            const created = await lastValueFrom(
                this.tenantService.criarTenant({
                    name: cleanName,
                    descriptions: (this.newTenantForm.descriptions || '').trim(),
                    organizacaoId: orgId,
                    permissions: { ...this.newTenantForm.permissions },
                }),
            );
            await this.loadAvailableTenants(orgId);
            if (created?.id) {
                this.selectedTenantIds = [created.id];
            }
            this.tenantPanelMode = 'none';
            this.tenantActionFeedback = `Tenant "${created?.name || cleanName}" criado com sucesso.`;
            await this.search();
            return created;
        } catch (err: any) {
            this.tenantActionError = err?.error?.message || err?.message || 'Erro ao criar tenant.';
            return null;
        } finally {
            this.tenantActionBusy = false;
        }
    }

    async saveEditedTenant(): Promise<TenantWithPermissionsDto | null> {
        const selected = this.primarySelectedTenant;
        if (!selected) return null;
        const cleanName = (this.editTenantForm.name || '').trim();
        if (!cleanName) {
            this.tenantActionError = 'O nome do tenant não pode ser vazio.';
            return null;
        }
        if (!this.tenantService || typeof this.tenantService.atualizarTenant !== 'function') {
            this.tenantActionError = 'Serviço de Tenant indisponível.';
            return null;
        }

        this.tenantActionBusy = true;
        this.tenantActionError = undefined;
        this.tenantActionFeedback = undefined;

        try {
            const updated = await lastValueFrom(
                this.tenantService.atualizarTenant(selected.id, {
                    name: cleanName,
                    descriptions: (this.editTenantForm.descriptions || '').trim(),
                    organizacaoId: this.activeOrganizationId,
                }),
            );
            await this.loadAvailableTenants(this.activeOrganizationId);
            this.tenantPanelMode = 'none';
            this.tenantActionFeedback = `Tenant "${updated?.name || cleanName}" atualizado.`;
            return updated;
        } catch (err: any) {
            this.tenantActionError = err?.error?.message || err?.message || 'Erro ao atualizar tenant.';
            return null;
        } finally {
            this.tenantActionBusy = false;
        }
    }

    async loadTenantPermissions(tenantId: string): Promise<TenantPermissionItemDto[]> {
        if (!this.tenantService || typeof this.tenantService.listarPermissoesTenant !== 'function') {
            this.tenantPermissionsList = [];
            return [];
        }
        this.tenantActionBusy = true;
        try {
            this.tenantPermissionsList = (await lastValueFrom(
                this.tenantService.listarPermissoesTenant(tenantId),
            )) || [];
            return this.tenantPermissionsList;
        } catch (err: any) {
            this.tenantActionError = err?.error?.message || err?.message || 'Erro ao carregar permissões do tenant.';
            return [];
        } finally {
            this.tenantActionBusy = false;
        }
    }

    async saveTenantPermission(): Promise<TenantPermissionItemDto | null> {
        const selected = this.primarySelectedTenant;
        if (!selected || !this.tenantService || typeof this.tenantService.definirPermissaoTenant !== 'function') {
            return null;
        }
        this.tenantActionBusy = true;
        this.tenantActionError = undefined;
        this.tenantActionFeedback = undefined;

        try {
            const saved = await lastValueFrom(
                this.tenantService.definirPermissaoTenant(selected.id, {
                    emailOrUsername: this.newPermissionForm.emailOrUsername?.trim() || undefined,
                    role: this.newPermissionForm.role?.trim() || undefined,
                    organizacaoId: this.activeOrganizationId,
                    canVisualizar: this.newPermissionForm.canVisualizar,
                    canVer: this.newPermissionForm.canVer,
                    canEditar: this.newPermissionForm.canEditar,
                    canCompartilhar: this.newPermissionForm.canCompartilhar,
                }),
            );
            await this.loadTenantPermissions(selected.id);
            this.newPermissionForm.emailOrUsername = '';
            this.newPermissionForm.role = '';
            this.tenantActionFeedback = 'Permissão do tenant salva com sucesso.';
            return saved;
        } catch (err: any) {
            this.tenantActionError = err?.error?.message || err?.message || 'Erro ao salvar permissão do tenant.';
            return null;
        } finally {
            this.tenantActionBusy = false;
        }
    }

    async removeTenantPermission(permissionId: string): Promise<void> {
        const selected = this.primarySelectedTenant;
        if (!selected || !this.tenantService || typeof this.tenantService.removerPermissaoTenant !== 'function') {
            return;
        }
        this.tenantActionBusy = true;
        this.tenantActionError = undefined;
        try {
            await lastValueFrom(this.tenantService.removerPermissaoTenant(selected.id, permissionId));
            await this.loadTenantPermissions(selected.id);
        } catch (err: any) {
            this.tenantActionError = err?.error?.message || err?.message || 'Erro ao remover permissão do tenant.';
        } finally {
            this.tenantActionBusy = false;
        }
    }

    async search() {
        if (!this.service || !this.service.getList) {
            this.source = [];
            return;
        }
        this.loading = true;
        try {
            const cleanFilter: Record<string, any> = {};
            Object.keys(this.columnFilters || {}).forEach(k => {
                const val = this.columnFilters[k];
                if (val !== undefined && val !== null && String(val).trim() !== '') {
                    cleanFilter[k] = val;
                }
            });

            const hasFilter = Object.keys(cleanFilter).length > 0;
            const hasSearch = !!this.searchText && this.searchText.trim().length > 0;
            const hasOrder = !!this.order && Object.keys(this.order).length > 0;
            const hasTenantsFilter = (this.selectedTenantIds?.length || 0) > 0;

            const body: any = {
                ...(this.searchDefault || {}),
            };
            if (hasFilter) {
                body.where = cleanFilter;
                body.filter = cleanFilter;
            }
            if (hasTenantsFilter) {
                body.tenantIds = [...this.selectedTenantIds];
                body.tenants = this.selectedTenantIds.map(id => ({ id }));
            }
            if (hasSearch) {
                body.search = this.searchText.trim();
            }
            if (hasOrder) {
                body.orderBy = this.order;
            }

            const response = await lastValueFrom(this.service.getList({ body }));
            const rawItems = Array.isArray(response)
                ? response
                : (response && Array.isArray((response as any).data) ? (response as any).data : []);

            const daos = this.daos || this.injector?.get(DaoService, null);
            const readItems = (await daos?.read(rawItems, this.schemaName)) || rawItems || [];
            this.allSource = Array.isArray(readItems) ? readItems : [];
            this.hydrateItemsTenants(this.allSource);
            this.ensureFieldsFromData(this.allSource);
            this.ensureTenantColumnInGrid(this.allSource);
            this.source = this.applyLocalFilterAndSort(this.allSource, cleanFilter, this.searchText, this.order);
        } catch (error) {
            console.trace(error);
        } finally {
            this.loading = false;
        }
    }

    private applyLocalFilterAndSort(
        items: T[],
        filters: Record<string, any>,
        searchText?: string,
        orderBy?: Record<string, 'ASC' | 'DESC'>
    ): T[] {
        let result = [...(items || [])];

        if ((this.selectedTenantIds?.length || 0) > 0) {
            const selectedSet = new Set(this.selectedTenantIds);
            const hasAnyTenantMetadata = result.some((item: any) => Array.isArray(item?.tenants) || Boolean(item?.tenantId));
            if (hasAnyTenantMetadata) {
                result = result.filter((item: any) => {
                    if (item?.tenantId && selectedSet.has(String(item.tenantId))) {
                        return true;
                    }
                    if (Array.isArray(item?.tenants)) {
                        return item.tenants.some((t: any) => {
                            const tid = typeof t === 'string' ? t : t?.id;
                            return Boolean(tid && selectedSet.has(String(tid)));
                        });
                    }
                    return false;
                });
            }
        }

        const filterKeys = Object.keys(filters || {});
        if (filterKeys.length > 0) {
            result = result.filter((item: any) => {
                return filterKeys.every(key => {
                    const filterVal = filters[key];
                    if (filterVal === undefined || filterVal === null || String(filterVal).trim() === '') return true;
                    const itemVal = item?.[key];
                    if (itemVal === undefined || itemVal === null) return false;
                    const formattedItem = this.formatFieldValue(itemVal).toLowerCase();
                    const needle = String(filterVal).trim().toLowerCase();
                    return formattedItem.includes(needle);
                });
            });
        }

        if (searchText && searchText.trim().length > 0) {
            const needle = searchText.trim().toLowerCase();
            result = result.filter((item: any) => {
                return this.visibleFields.some(f => {
                    const val = item?.[f.key];
                    if (val === undefined || val === null) return false;
                    return this.formatFieldValue(val).toLowerCase().includes(needle);
                });
            });
        }

        const orderKeys = Object.keys(orderBy || {});
        if (orderKeys.length > 0) {
            result.sort((a: any, b: any) => {
                for (const key of orderKeys) {
                    const dir = orderBy![key] === 'DESC' ? -1 : 1;
                    const va = this.formatFieldValue(a?.[key]).toLowerCase();
                    const vb = this.formatFieldValue(b?.[key]).toLowerCase();
                    if (va < vb) return -1 * dir;
                    if (va > vb) return 1 * dir;
                }
                return 0;
            });
        }

        return result;
    }

    async editar(data?: T, event?: Event) {
        if (!data) return;
        const effectiveSchemaProperties: { [key: string]: ISchemaProperty } = {
            ...(this.schemaProperties || {}),
        };
        for (const f of this.visibleFields) {
            if (!effectiveSchemaProperties[f.key]) {
                effectiveSchemaProperties[f.key] = f.prop || {
                    title: f.title,
                    type: f.type,
                    format: f.format,
                    enum: f.enum,
                };
            }
        }
        const windowService = this.window || this.injector?.get(WindowService, null);
        if (!windowService) {
            console.warn('WindowService não encontrado no injetor para abrir edição do schema:', this.schemaName);
            return;
        }
        const result: number | any = await windowService.open(
            EditarDetailComponent,
            {
                schemaName: this.schemaName,
                data,
                schemaProperties: effectiveSchemaProperties,
                service: this.service,
                availableTenants: this.availableTenants,
                organizacaoId: this.activeOrganizationId,
            },
            this.schemaName,
            event
        );
        if (result === -1 && this.source) {
            const pos = this.source.indexOf(data);
            if (pos > -1) this.source.splice(pos, 1);
            this.source = [...this.source];
        } else {
            await this.search();
        }
    }

    async excluir(data: T, event?: Event) {
        event?.stopPropagation();
        if (!data || !this.service?.delete) return;
        try {
            await lastValueFrom(this.service.delete({ body: data }));
            this.source = (this.source || []).filter(item => item !== data);
        } catch (error) {
            console.trace(error);
        }
    }

    async createNew() {
        if (this.service) {
            const initialData: Record<string, any> = {};
            if (this.selectedTenantIds.length > 0) {
                initialData['tenants'] = this.selectedTenantIds.map(id => ({ id }));
            }
            let instance: any = await lastValueFrom(this.service.sync({
                body: { data: initialData }
            }));
            if (instance && typeof instance === 'object' && 'data' in instance && instance.data) {
                instance = instance.data;
            }
            if (this.selectedTenantIds.length > 0 && instance && typeof instance === 'object' && !Array.isArray(instance.tenants)) {
                instance.tenants = this.selectedTenantIds.map(id => ({ id }));
            }
            if (this.daos) {
                instance = await this.daos.read(instance, this.schemaName);
            }
            const data: number | any = await this.editar(instance);
            if (!(typeof data === 'number') && (!!data?.internalId || !!data?.id)) {
                await this.search();
            }
        }
    }

    async sortHandle(event: any) {
        this.order = event;
        await this.search();
    }

    getItemTitle(item: any): string {
        if (!item) return this.schemaName || 'Registro';
        const priorityKeys = [
            'nome',
            'name',
            'razaoSocial',
            'nomeFantasia',
            'logradouro',
            'address',
            'description',
            'numeroDocumento',
            'code',
            'internationalCode',
            'ibgeCode',
            'internationaName',
        ];
        for (const key of priorityKeys) {
            if (item[key] && String(item[key]).trim() !== '') {
                return String(item[key]);
            }
        }
        for (const f of this.visibleFields) {
            const v = this.formatFieldValue(item[f.key]);
            if (v) return v;
        }
        const idStr = item.internalId || item.id;
        return idStr ? `#${String(idStr).slice(0, 8)}` : `${this.schemaName} (Novo)`;
    }

    getItemSubtitle(item: any): string {
        if (!item) return '';
        const title = this.getItemTitle(item);
        for (const f of this.visibleFields) {
            const v = this.formatFieldValue(item[f.key]);
            if (v && v !== title) {
                return `${f.title}: ${v}`;
            }
        }
        return '';
    }

    getItemInitials(item: any): string {
        const title = this.getItemTitle(item);
        const words = title.replace(/[^a-zA-ZÀ-ÿ0-9 ]/g, ' ').trim().split(/\s+/).filter(Boolean);
        if (words.length >= 2) {
            return (words[0][0] + words[1][0]).toUpperCase();
        }
        return (title.slice(0, 2) || 'CA').toUpperCase();
    }

    getEntityIcon(): string {
        const map: Record<string, string> = {
            Pessoa: 'person',
            Endereco: 'place',
            InformacaoContato: 'contact_phone',
            DocumentoIdentificacao: 'badge',
            TipoDocumentoIdentificacao: 'assignment_ind',
            Category: 'category',
            UnidadeMedida: 'straighten',
            Pais: 'public',
        };
        return (this.schemaName && map[this.schemaName]) || 'article';
    }

    formatFieldValue(val: any): string {
        if (val === null || val === undefined) return '';
        if (typeof val === 'boolean') return val ? 'Sim' : 'Não';
        if (Array.isArray(val)) {
            if (val.length === 0) return '';
            return val.map(v => this.formatFieldValue(v)).filter(Boolean).join(', ');
        }
        if (typeof val === 'object') {
            return val.nome || val.name || val.title || val.description || val.logradouro || val.address || val.numeroDocumento || val.code || val.internationalCode || val.ibgeCode || '';
        }
        return String(val);
    }

    getItemTenants(item: any): Array<{ id: string; name?: string }> {
        if (!item || typeof item !== 'object') return [];
        const raw: any[] = [];
        if (Array.isArray(item.tenants)) {
            raw.push(...item.tenants);
        }
        if (item.tenantId && !raw.some(t => (typeof t === 'string' ? t : t?.id) === item.tenantId)) {
            raw.push({ id: item.tenantId, name: item.tenant?.name });
        }
        const seen = new Set<string>();
        const out: Array<{ id: string; name?: string }> = [];
        for (const entry of raw) {
            const id = typeof entry === 'string' ? entry.trim() : String(entry?.id || '').trim();
            if (!id || seen.has(id)) continue;
            seen.add(id);
            const matched = (this.availableTenants || []).find(t => t.id === id);
            out.push({
                id,
                name: (typeof entry === 'object' ? entry?.name : undefined) || matched?.name || id,
            });
        }
        return out;
    }

    hasTenantOwner(item: any): boolean {
        return this.getItemTenants(item).length > 0;
    }

    getItemTenantLabel(item: any): string {
        return this.getItemTenants(item).map(t => t.name || t.id).join(', ');
    }

    isItemInSelectedTenant(item: any): boolean {
        if (!this.selectedTenantIds?.length) return false;
        const selected = new Set(this.selectedTenantIds);
        return this.getItemTenants(item).some(t => selected.has(t.id));
    }

    private hydrateItemsTenants(items: T[]): void {
        if (!Array.isArray(items) || items.length === 0) return;
        for (const item of items as any[]) {
            if (!item || typeof item !== 'object') continue;
            if (Array.isArray(item.tenants) && item.tenants.length > 0) {
                item.tenants = item.tenants.map((t: any) => {
                    const id = typeof t === 'string' ? t.trim() : String(t?.id || '').trim();
                    if (!id) return t;
                    const matched = (this.availableTenants || []).find(at => at.id === id);
                    if (typeof t === 'object') {
                        return matched && !t.name ? { ...t, name: matched.name, descriptions: matched.descriptions } : t;
                    }
                    return matched ? { id, name: matched.name, descriptions: matched.descriptions } : { id };
                });
            }
        }
    }

    private ensureTenantColumnInGrid(items?: T[]): void {
        if (!this.gridOptions) return;
        const cols = this.gridOptions.columns || [];
        const hasTenantData = Array.isArray(items) && items.some(it => this.hasTenantOwner(it));
        const hasTenantSchemaProp = Boolean(this.schemaProperties?.['tenants']);
        if (!hasTenantData && !hasTenantSchemaProp) return;

        const existingCol = cols.find(c => c.fieldName === 'tenants');
        if (existingCol) {
            existingCol.headerName = 'Tenant Proprietário';
            existingCol.hide = false;
        } else {
            this.gridOptions = {
                ...this.gridOptions,
                columns: [
                    ...cols,
                    {
                        headerName: 'Tenant Proprietário',
                        fieldName: 'tenants',
                        type: 'array',
                        hide: false,
                    },
                ],
            };
        }
    }
}
