import { Component, Inject, Injector, Input, OnDestroy, OnInit, Optional } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { ActivatedRoute } from "@angular/router";
import { ActionsService } from "@ci/components/action";
import { IItemMenu } from "@ci/components/window";
import { CORE_ENV, DaoBuilder, DaoService, IAmSchematization, IChangeable, ICoreEnvironment, IHaveSync, ISchemaPreset, ISchemaProperty } from "@ci/core";
import { FormsService, getServiceAsSchema } from "@ci/portal-api";
import { lastValueFrom, Subscription } from "rxjs";
/**
 * Interface genérica para construção do editor de dados.
 */
export interface IDataEditar {
    data: any;
    schemaName: string;
    schemaProperties?: { [key: string]: ISchemaProperty };
    service?: any;
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
    private confirmationSub?: Subscription;
    actions: IItemMenu[] = [{
        label: 'Remover Registro',
        icon: 'delete',
        onClick: async () => {
            if (!!this.service && !!this.editor_data) await lastValueFrom(this.service.delete({ body: this.editor_data.data }));
            this.ref?.close(-1);
        }
    }];
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
    ) {
        if (editor_data && 'schemaName' in editor_data && editor_data.schemaName) this.schemaName = editor_data.schemaName;
        if (editor_data?.service) this.service = editor_data.service;
        acts?.setActions(this.actions);
    }
    /**
     * Inicie a carga de memória em cache do seu componente neste ponto
     */
    ngOnInit() {
        this.loadFormFromDaoBuilder();
    }
    /**
     * Quando o componente for desmontado, livre a memória
     */
    ngOnDestroy(): void {
        this.confirmationSub?.unsubscribe();
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
