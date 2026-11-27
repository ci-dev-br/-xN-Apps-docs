import { ChangeDetectorRef, Component, Inject, Injector, Input, OnDestroy, OnInit, Optional } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { ActivatedRoute } from "@angular/router";
import { UserAuthenticationService } from "@ci/auth";
import { NavbarService } from "@ci/components";
import { ActionsService } from "@ci/components/action";
import { IItemMenu } from "@ci/components/window";
import { CORE_ENV, DaoBuilder, DaoService, IAmSchematization, IChangeable, ICoreEnvironment, IHaveSync, ISchemaPreset, ISchemaProperty, WsService } from "@ci/core";
import { FormsService, getServiceAsSchema, TenantService, TenantWithPermissionsDto } from "@ci/portal-api";
import { BehaviorSubject, lastValueFrom, Subscription } from "rxjs";
/**
 * Interface genérica para construção do editor de dados.
 */
export interface IDataEditar {
    data: any;
    schemaName: string;
    schemaProperties?: { [key: string]: ISchemaProperty };
    service?: any;
    availableTenants?: TenantWithPermissionsDto[];
    organizacaoId?: string;
}
export interface IOwnerTenantInfo {
    id: string;
    name?: string;
    descriptions?: string;
    organizacaoId?: string;
}
/**
 * Componente de Edição de Dados 
 * Os dados podem ser fornecidos via schema ou injetados em 
 * tempo de compilação ou execução.
 */
@Component({
    selector: 'ci-master-detail--editar',
    styleUrl: 'editar-detail.component.scss',
    templateUrl: 'editar-detail.component.html',
    standalone: false,
})
export class EditarDetailComponent implements OnInit, OnDestroy, IAmSchematization {
    form?: FormGroup<any>;
    @Input()
    schemaName: string = undefined!;
    service?: any;
    preset?: ISchemaPreset<any, any>;
    availableTenants: TenantWithPermissionsDto[] = [];
    loadingTenants = false;
    transferringTenant = false;
    tenantTransferFeedback?: string;
    tenantTransferError?: string;
    private confirmationSub?: Subscription;
    private destroyed = false;
    private windowActionsQueued = false;
    actions: IItemMenu[] = [];
    constructor(
        @Optional() private readonly dao?: DaoService,
        @Optional() private readonly daoBuilder?: DaoBuilder,
        @Optional() private readonly fb?: FormBuilder,
        @Optional() private readonly formsService?: FormsService,
        @Optional() private readonly route?: ActivatedRoute,
        @Optional() private readonly injector?: Injector,
        @Optional() private readonly ref?: MatDialogRef<EditarDetailComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) public readonly editor_data?: IDataEditar,
        @Optional() @Inject(CORE_ENV) private readonly config?: ICoreEnvironment,
        @Optional() public readonly acts?: ActionsService,
        @Optional() @Inject('ACTIONS') private readonly windowActions$?: BehaviorSubject<IItemMenu[] | undefined>,
        @Optional() private readonly tenantService?: TenantService,
        @Optional() private readonly userAuth?: UserAuthenticationService,
        @Optional() private readonly navbarService?: NavbarService,
        @Optional() private readonly ws?: WsService,
        @Optional() private readonly cdr?: ChangeDetectorRef,
    ) {
        if (editor_data && 'schemaName' in editor_data && editor_data.schemaName) this.schemaName = editor_data.schemaName;
        if (editor_data?.service) this.service = editor_data.service;
        if (Array.isArray(editor_data?.availableTenants) && editor_data.availableTenants.length > 0) {
            this.availableTenants = [...editor_data.availableTenants];
        }
        this.publishWindowActions();
    }

    get hasWindowActions(): boolean {
        return Boolean(this.windowActions$);
    }

    get objectTenants(): IOwnerTenantInfo[] {
        const data = this.editor_data?.data;
        if (!data || typeof data !== 'object') return [];

        const rawList: any[] = [];
        if (Array.isArray(data.tenants)) {
            rawList.push(...data.tenants);
        }
        if (data.tenantId && !rawList.some(t => (typeof t === 'string' ? t : t?.id) === data.tenantId)) {
            rawList.push({ id: data.tenantId, name: data.tenant?.name });
        }

        const seen = new Set<string>();
        const result: IOwnerTenantInfo[] = [];
        for (const item of rawList) {
            const id = typeof item === 'string' ? item.trim() : String(item?.id || '').trim();
            if (!id || seen.has(id)) continue;
            seen.add(id);

            const resolved = this.resolveTenantMeta(id, typeof item === 'object' ? item : undefined);
            result.push(resolved);
        }
        return result;
    }

    get hasOwnerTenant(): boolean {
        return this.objectTenants.length > 0;
    }

    isOwnedByTenant(tenantId?: string): boolean {
        if (!tenantId) return false;
        return this.objectTenants.some(t => t.id === tenantId);
    }

    canTransferToTenant(tenant: TenantWithPermissionsDto): boolean {
        return tenant?.permissionsSummary?.canEditar !== false;
    }

    private resolveTenantMeta(tenantId: string, rawObj?: any): IOwnerTenantInfo {
        const fromAvailable = this.availableTenants.find(t => t.id === tenantId);
        const fromUser = (this.userAuth?.user?.value?.tenants || []).find((t: any) => t?.id === tenantId);
        const orgAccess = this.navbarService?.organizationAccess?.();
        const fromOrgAccess = orgAccess?.tenantId === tenantId ? orgAccess : undefined;

        return {
            id: tenantId,
            name: rawObj?.name || fromAvailable?.name || fromUser?.name || fromOrgAccess?.tenantName || undefined,
            descriptions: rawObj?.descriptions || fromAvailable?.descriptions || fromUser?.descriptions || undefined,
            organizacaoId: rawObj?.organizacaoId || fromAvailable?.organizacaoId || fromUser?.organizacaoId || undefined,
        };
    }

    private hydrateDataTenants(data: any): void {
        if (!data || !Array.isArray(data.tenants)) return;
        data.tenants = data.tenants
            .map((item: any) => {
                const id = typeof item === 'string' ? item.trim() : String(item?.id || '').trim();
                if (!id) return null;
                return this.resolveTenantMeta(id, typeof item === 'object' ? item : undefined);
            })
            .filter(Boolean);
    }

    private buildWindowActions(): IItemMenu[] {
        const tenantChildren: IItemMenu[] = [];

        if (this.availableTenants.length === 0) {
            tenantChildren.push({
                label: this.loadingTenants ? 'Carregando tenants...' : 'Nenhum tenant disponível',
                icon: 'info_outline',
                disabled: true,
            });
        } else {
            for (const tenant of this.availableTenants) {
                const isReadOnly = !this.canTransferToTenant(tenant);
                tenantChildren.push({
                    label: tenant.name || tenant.id,
                    description: isReadOnly
                        ? 'Somente leitura (sem permissão de edição)'
                        : (tenant.descriptions || undefined),
                    icon: 'workspaces',
                    checked: () => this.isOwnedByTenant(tenant.id),
                    disabled: () => this.transferringTenant || !this.canTransferToTenant(tenant),
                    onClick: () => {
                        void this.transferToTenant(tenant);
                    },
                });
            }
        }

        if (this.hasOwnerTenant) {
            tenantChildren.push({ divider: true });
            tenantChildren.push({
                label: 'Devolver para Usuário (Remover Tenant)',
                description: 'Remove o vínculo com o tenant proprietário',
                icon: 'person_outline',
                disabled: () => this.transferringTenant,
                onClick: () => {
                    void this.transferToTenant(null);
                },
            });
        }

        return [
            {
                label: 'Opções do Registro',
                tooltip: 'Ações do registro e transferência de tenant',
                icon: 'more_vert',
                children: [
                    {
                        label: 'Transferir para Tenant Proprietário',
                        description: this.hasOwnerTenant
                            ? `Atual: ${this.objectTenants.map(t => t.name || t.id).join(', ')}`
                            : 'Objeto pertencente ao usuário',
                        icon: 'workspaces',
                        checked: () => this.hasOwnerTenant,
                        children: tenantChildren,
                    },
                    { divider: true },
                    {
                        label: 'Remover Registro',
                        icon: 'delete',
                        color: 'warn',
                        disabled: () => !this.service?.delete || this.transferringTenant,
                        onClick: () => {
                            void this.removeRecord();
                        },
                    },
                ],
            },
        ];
    }

    private publishWindowActions(): void {
        this.actions = this.buildWindowActions();
        this.acts?.setActions(this.actions);
        if (this.windowActions$ && !this.windowActionsQueued) {
            this.windowActionsQueued = true;
            queueMicrotask(() => {
                this.windowActionsQueued = false;
                if (!this.destroyed) {
                    this.windowActions$?.next(this.actions);
                }
            });
        }
    }

    async removeRecord(): Promise<void> {
        if (!!this.service?.delete && !!this.editor_data) {
            await lastValueFrom(this.service.delete({ body: this.editor_data.data }));
        }
        this.ref?.close(-1);
    }

    async loadAvailableTenants(): Promise<TenantWithPermissionsDto[]> {
        const orgId = this.editor_data?.organizacaoId || this.navbarService?.organizationAccess?.()?.organizationId;
        const merged = new Map<string, TenantWithPermissionsDto>();

        const pushTenant = (t?: any) => {
            if (!t?.id) return;
            const existing = merged.get(t.id);
            merged.set(t.id, {
                ...(existing || {}),
                ...t,
                permissionsSummary: t.permissionsSummary || existing?.permissionsSummary,
            });
        };

        (this.editor_data?.availableTenants || []).forEach(pushTenant);
        (this.userAuth?.user?.value?.tenants || []).forEach(pushTenant);

        const orgAccess = this.navbarService?.organizationAccess?.();
        if (orgAccess?.tenantId) {
            pushTenant({
                id: orgAccess.tenantId,
                name: orgAccess.tenantName || `ORG: ${orgAccess.organizationName || 'Organização'}`,
                organizacaoId: orgAccess.organizationId,
                permissionsSummary: {
                    canVisualizar: true,
                    canVer: true,
                    canEditar: Boolean(orgAccess.isOwner || orgAccess.roles?.includes('ORG_ADMIN')),
                    canCompartilhar: Boolean(orgAccess.isOwner || orgAccess.roles?.includes('ORG_ADMIN')),
                },
            });
        }

        if (this.tenantService && typeof this.tenantService.listarTenantsDisponiveis === 'function') {
            this.loadingTenants = true;
            this.publishWindowActions();
            try {
                const remoteOrg = orgId
                    ? await lastValueFrom(this.tenantService.listarTenantsDisponiveis(orgId))
                    : await lastValueFrom(this.tenantService.listarTenantsDisponiveis());
                (remoteOrg || []).forEach(pushTenant);
            } catch {
                // Mantém tenants em cache caso o endpoint não responda
            } finally {
                this.loadingTenants = false;
            }
        }

        this.availableTenants = Array.from(merged.values())
            .filter(t => t.permissionsSummary?.canVisualizar !== false || t.permissionsSummary?.canVer !== false)
            .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

        if (this.editor_data?.data) {
            this.hydrateDataTenants(this.editor_data.data);
        }
        this.publishWindowActions();
        this.cdr?.markForCheck();
        return this.availableTenants;
    }

    private hasOtherUnsavedChanges(data: any): boolean {
        if (!this.dao || !data) return false;
        const changes = this.dao.getChanges(data) || {};
        return Object.keys(changes).some(k => !['id', 'internalId', 'tenants'].includes(k));
    }

    async transferToTenant(tenant: TenantWithPermissionsDto | null): Promise<boolean> {
        const data = this.editor_data?.data;
        if (!data || typeof data !== 'object') return false;
        if (tenant && !this.canTransferToTenant(tenant)) return false;

        const previousTenants = Array.isArray(data.tenants) ? [...data.tenants] : data.tenants;
        const minimalTenants = tenant ? [{ id: tenant.id }] : [];
        const hydratedTenants: IOwnerTenantInfo[] = tenant
            ? [{
                id: tenant.id,
                name: tenant.name || tenant.id,
                descriptions: tenant.descriptions,
                organizacaoId: tenant.organizacaoId,
            }]
            : [];

        this.transferringTenant = true;
        this.tenantTransferFeedback = undefined;
        this.tenantTransferError = undefined;
        this.publishWindowActions();

        try {
            const dao = this.dao || this.injector?.get(DaoService, null);
            const hadOtherChanges = this.hasOtherUnsavedChanges(data);

            data.tenants = hydratedTenants;
            if (this.form?.get('tenants')) {
                this.form.get('tenants')!.setValue(hydratedTenants, { emitEvent: false });
            }

            const hasPersistedId = Boolean(data.internalId || data.id);
            if (hasPersistedId) {
                if (!this.service) {
                    await this.loadService();
                }

                if (this.preset?.sync && this.service) {
                    const cleanData = dao ? dao.sanitizeDeep(data) : { ...data };
                    cleanData.tenants = minimalTenants;
                    await this.preset.sync(this.service, cleanData);
                } else if (this.service?.sync) {
                    const transferPayload: Record<string, any> = {
                        tenants: minimalTenants,
                    };
                    if (data.internalId) transferPayload['internalId'] = data.internalId;
                    else if (data.id) transferPayload['id'] = data.id;

                    await lastValueFrom((this.service as IHaveSync<any>).sync({ body: { data: transferPayload } }));
                }

                data.tenants = hydratedTenants;
                if (this.form?.get('tenants')) {
                    this.form.get('tenants')!.setValue(hydratedTenants, { emitEvent: false });
                }

                if (!hadOtherChanges) {
                    await dao?.prepareToEdit(data, { schemaName: this.schemaName });
                }

                if (dao) {
                    this.ws?.Propagar(dao.sanitizeDeep(data));
                }
            }

            this.tenantTransferFeedback = tenant
                ? `Objeto transferido para o tenant "${tenant.name || tenant.id}".`
                : 'Propriedade do objeto devolvida ao usuário.';
            return true;
        } catch (err: any) {
            data.tenants = previousTenants;
            if (this.form?.get('tenants')) {
                this.form.get('tenants')!.setValue(previousTenants ?? null, { emitEvent: false });
            }
            this.tenantTransferError = err?.error?.message || err?.message || 'Erro ao transferir objeto para o tenant.';
            return false;
        } finally {
            this.transferringTenant = false;
            this.publishWindowActions();
            this.cdr?.markForCheck();
        }
    }

    /**
     * Inicie a carga de memória em cache do seu componente neste ponto
     */
    ngOnInit() {
        this.loadFormFromDaoBuilder();
        void this.loadAvailableTenants();
    }
    /**
     * Quando o componente for desmontado, livre a memória
     */
    ngOnDestroy(): void {
        this.destroyed = true;
        this.confirmationSub?.unsubscribe();
        this.windowActions$?.next(undefined);
    }
    /**
     * Carregar serviços do Objeto em Evidência
     */
    private async loadService() {
        if (this.schemaName) {
            this.preset = this.config?.servicesCommons?.find(s => s.schemaName === this.schemaName);
            if (!!this.preset?.service) {
                this.service = this.injector?.get(this.preset.service, null) || this.editor_data?.service;
            }
            if (!this.preset && !this.service) {
                const service_by_schema = getServiceAsSchema(this.schemaName);
                if (service_by_schema) {
                    this.service = this.injector?.get(service_by_schema, null);
                }
            }
            if (!this.service && this.editor_data?.service) {
                this.service = this.editor_data.service;
            }
        }
    }
    /**
     * Montar Formulário a partir de DaoBuilder
     */
    private async loadFormFromDaoBuilder() {
        if (this.schemaName) {
            const dao = this.dao || this.injector?.get(DaoService, null);
            const daoBuilder = this.daoBuilder || this.injector?.get(DaoBuilder, null);
            const _data = this.editor_data?.data;

            await this.loadService();
            this.publishWindowActions();
            await dao?.prepareToEdit(_data, { schemaName: this.schemaName });

            this.confirmationSub?.unsubscribe();
            this.confirmationSub = dao?.confirmation(_data)?.subscribe(async data => {
                try {
                    if (this.editor_data?.data) {
                        if (!this.service) {
                            await this.loadService();
                        }
                        // Garante que todos os valores atuais do FormGroup sejam sincronizados para o objeto antes do envio
                        if (this.form) {
                            const rawFormValues = this.form.getRawValue();
                            if (rawFormValues && typeof rawFormValues === 'object') {
                                Object.keys(rawFormValues).forEach(k => {
                                    if (rawFormValues[k] !== undefined) {
                                        this.editor_data!.data[k] = rawFormValues[k];
                                    }
                                });
                            }
                        }

                        if (!!(this.preset)?.sync && this.service) {
                            const cleanData = dao ? dao.sanitizeDeep(this.editor_data.data) : this.editor_data.data;
                            const synced = await this.preset.sync(this.service, cleanData);
                            const unpacked = (synced && typeof synced === 'object' && 'data' in synced && (synced as any).data)
                                ? (synced as any).data
                                : synced;
                            if (unpacked && typeof unpacked === 'object') {
                                Object.assign(this.editor_data.data, unpacked);
                            }
                        } else if (this.service && this.service.sync) {
                            const cleanData = dao ? dao.sanitizeDeep(this.editor_data.data) : this.editor_data.data;
                            const payload_dao: any = await lastValueFrom((this.service as IHaveSync<any>).sync({ body: { data: cleanData } }));
                            const unpacked = (payload_dao && typeof payload_dao === 'object' && 'data' in payload_dao && payload_dao.data)
                                ? payload_dao.data
                                : payload_dao;
                            if (unpacked && typeof unpacked === 'object') {
                                Object.assign(this.editor_data.data, unpacked);
                            }
                        }
                        this.hydrateDataTenants(this.editor_data.data);
                        this.publishWindowActions();
                        delete (this.editor_data.data as IChangeable).__pre;
                        await dao?.prepareToEdit(this.editor_data.data, { schemaName: this.schemaName });
                        if (this.form) dao?.bindDataForm(this.editor_data.data, this.form);
                    }
                } catch (error) {
                    console.trace(error);
                }
            });

            this.form = await daoBuilder?.getForm(this.schemaName, _data, this.editor_data?.schemaProperties);
            if (this.form) {
                dao?.bindDataForm(_data, this.form);
            }
        }
    }
}
