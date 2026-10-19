import { AfterViewInit, Component, Injector, Input, OnChanges, OnDestroy, OnInit, Optional, SimpleChanges } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ActionsService } from "@ci/components/action";
import { GridBuilder, IColumnOption } from "@ci/components/data-grid";
import { EditarDetailComponent } from "@ci/components/editar-detail";
import { WindowService } from "@ci/components/window";
import { DaoBuilder, DaoService, IAmSchematization, ISchema, ISchemaProperty } from "@ci/core";
import { getServiceAsSchema } from "@ci/portal-api";
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
    ) { }

    get activeFilterCount(): number {
        return Object.keys(this.columnFilters || {}).filter(k => {
            const v = this.columnFilters[k];
            return v !== undefined && v !== null && String(v).trim() !== '';
        }).length;
    }

    async ngOnChanges(changes: SimpleChanges) {
        if (changes['schemaName'] && !changes['schemaName'].firstChange && this.schemaName) {
            await this.prepareSchema();
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
                    const isRelation = prop.type === 'array' || prop.type === 'object' || !!prop.$ref || !!prop.items;
                    return {
                        key,
                        title: prop?.title || key,
                        type: prop?.type || 'string',
                        format: prop?.format,
                        enum: prop?.enum,
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
                this.service = serviceType ? this.injector?.get(serviceType, null) : undefined;
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
        this.search();
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

            const body: any = {
                ...(this.searchDefault || {}),
            };
            if (hasFilter) {
                body.where = cleanFilter;
                body.filter = cleanFilter;
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
            this.ensureFieldsFromData(this.allSource);
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
        const result: number | any = await this.window?.open(
            EditarDetailComponent,
            {
                schemaName: this.schemaName,
                data,
                schemaProperties: effectiveSchemaProperties,
                service: this.service,
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
            let instance: any = await lastValueFrom(this.service.sync({
                body: { data: {} }
            }));
            if (instance && typeof instance === 'object' && 'data' in instance && instance.data) {
                instance = instance.data;
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
}
