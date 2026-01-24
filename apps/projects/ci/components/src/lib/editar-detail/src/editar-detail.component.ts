import { CommonModule } from "@angular/common";
import { Component, Inject, Injector, Input, OnInit, Optional } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { DynFormModule, GridModule, IItemMenu, LNavModule, WindowModule } from "@ci/components";
import { CORE_ENV, CoreModule, DaoBuilder, DaoService, IChangeable, ICoreEnvironment, IHaveSync, ISchemaPreset } from "@ci/core";
import { FormsService, getServiceAsSchema } from "@ci/portal-api";
import { BehaviorSubject, lastValueFrom } from "rxjs";
import { EditarDetailModule } from "./editar-detail.module";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { AuthModule } from "@ci/auth";
import { MatSidenavModule } from "@angular/material/sidenav";
import { LayoutModule } from "@angular/cdk/layout";
import { MatMenuModule } from "@angular/material/menu";
/**
 * Interface genérica para construção do editor de dados.
 */
export interface IDataEditar {
    data: any;
    schemaName: string;
}
/**
 * Componente de Edição de Dados 
 * Os dados podem ser fornecidos via schema ou injetados em 
 * tempo de compilação ou execução.
 * 
 */
@Component({
    selector: 'ci-master-detail--editar',
    styleUrl: 'editar-detail.component.scss',
    template: `@if(form){<ci-dyn-form 
        [formGroup]="form" 
        [schemaName]="schemaName">
        </ci-dyn-form>}`,
    imports: [
        CoreModule,
        ReactiveFormsModule,
        DynFormModule,
    ],
    standalone: true,
})
export class EditarDetailComponent implements OnInit {
    form?: FormGroup<any>;
    @Input()
    schemaName?: string;
    service?: any;
    preset?: ISchemaPreset<any, any>;
    constructor(
        private readonly dao: DaoService,
        private readonly daoBuilder: DaoBuilder,
        private readonly fb: FormBuilder,
        private readonly formsService: FormsService,
        private readonly route: ActivatedRoute,
        private readonly injector: Injector,
        private readonly ref: MatDialogRef<EditarDetailComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) public readonly data?: IDataEditar,
        @Optional() @Inject(CORE_ENV) private readonly config?: ICoreEnvironment,
        @Optional() @Inject('ACTIONS') actions?: BehaviorSubject<IItemMenu[]>,
    ) {
        if (data && data.schemaName) this.schemaName = data.schemaName;
        if (actions) actions.next([...(actions.value || []), {
            label: 'Remover Aplicação',
            icon: 'delete',
            onClick: async () => {
                if (!!this.service && !!data) await lastValueFrom(this.service.delete({ body: data.data }));
                this.ref?.close(-1);
            }
        }])
    }
    ngOnInit() {
        this.loadFormFromDaoBuilder();
    }
    /**
     * Carregar serviços do Objeto em Evidência
     */
    private async loadService() {
        if (this.schemaName) {
            this.preset = this.config?.servicesCommons?.find(s => s.schemaName === this.schemaName);
            if (!!this.preset?.service)
                this.service = this.injector.get(this.preset.service);
            if (!this.preset) {
                const service_by_schema = getServiceAsSchema(this.schemaName);
                if (service_by_schema) this.service = this.injector.get(service_by_schema);
            }
        }
    }
    /**
     * Montar Formulário a partir de DaoBuilder
     */
    private async loadFormFromDaoBuilder() {
        if (this.schemaName) {
            await this.loadService();
            const dao = this.dao;
            const _data = this.data?.data;
            this.form = await this.daoBuilder.getForm(this.schemaName);
            const form = this.form;
            await this.dao.prepareToEdit(this.data?.data, { schemaName: this.schemaName });
            if (this.form) this.dao.bindDataForm(this.data?.data, this.form);
            this.dao.confirmation(this.data?.data)?.subscribe(async data => {
                try {
                    if (this.data?.data && data) {
                        if (!!(this.preset)?.sync) {
                            Object.assign(this.data?.data,
                                await this.preset.sync(this.service, this.data?.data)
                            );
                        } else if (this.service && this.service.sync) {
                            let r = await lastValueFrom((this.service as IHaveSync<any>).sync({ body: { data: this.data?.data } }))
                            r = r;
                        }
                        delete (_data as IChangeable).__pre;
                        await dao.prepareToEdit(_data);
                        if (form) dao.bindDataForm(_data, form);
                    }
                } catch (error) {
                    console.error(error);
                }
            });
        }
    }
}
