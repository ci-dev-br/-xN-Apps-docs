import { Component, Inject, Injector, Input, OnInit, Optional } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ActivatedRoute } from "@angular/router";
import { DynFormModule } from "@ci/components";
import { CORE_ENV, CoreModule, DaoBuilder, DaoService, IChangeable, ICoreEnvironment, ISchemaPreset } from "@ci/core";
import { FormsService } from "@ci/portal-api";
export interface IDataEditar {
    data: any;
    schemaName: string;
}
@Component({
    selector: 'ci-master-datail--editar',
    styleUrl: 'editar.component.scss',
    template: `@if(form){
<ci-dyn-form [formGroup]="form" [schemaName]="schemaName"></ci-dyn-form>
}`,
    imports: [
        CoreModule,
        ReactiveFormsModule,
        DynFormModule,
    ],
    standalone: true,
})
export class EditarComponent implements OnInit {
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
        @Inject(MAT_DIALOG_DATA)
        public readonly data?: IDataEditar,
        @Optional() @Inject(CORE_ENV) private readonly config?: ICoreEnvironment,
    ) {
        if (data && data.schemaName) this.schemaName = data.schemaName;
    }
    ngOnInit() {
        this.loadFormFromDaoBuilder();
    }
    private async loadFormFromDaoBuilder() {
        if (this.schemaName) {
            this.preset = this.config?.servicesCommons?.find(s => s.schemaName === this.schemaName);
            if (!!this.preset?.service)
                this.service = this.injector.get(this.preset.service);

            const dao = this.dao;
            const _data = this.data?.data;
            this.form = await this.daoBuilder.getForm(this.schemaName);
            const form = this.form;
            this.dao.prepareToEdit(this.data?.data);
            if (this.form) this.dao.bindDataForm(this.data?.data, this.form);
            this.dao.confirmation(this.data?.data)?.subscribe(async data => {
                try {
                    if (this.data?.data && data) {

                        if (!!this.preset?.sync) {
                            Object.assign(this.data?.data,
                                await this.preset.sync(this.service, this.data?.data)
                            );
                        }
                        delete (_data as IChangeable).__pre;
                        dao.prepareToEdit(_data);
                        if (form) dao.bindDataForm(_data, form);
                    }
                } catch (error) {
                }
            });
        }
    }
}