import { Component, Inject, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ActivatedRoute } from "@angular/router";
import { DynFormModule } from "@ci/components";
import { CoreModule, DaoBuilder, DaoService } from "@ci/core";
import { FormsService } from "@ci/portal-api";
export interface IDataEditar {
    data: any;
    schemaName: string;
}
@Component({
    selector: 'ci-master-datail--editar',
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
    constructor(
        private readonly dao: DaoService,
        private readonly daoBuilder: DaoBuilder,
        private readonly fb: FormBuilder,
        private readonly formsService: FormsService,
        private readonly route: ActivatedRoute,
        @Inject(MAT_DIALOG_DATA)
        public readonly data?: IDataEditar,
    ) {
        if (data && data.schemaName) this.schemaName = data.schemaName;
    }
    ngOnInit() {
        this.laodForm();
    }
    private async laodForm() {
        if (this.schemaName) {
            const dao = this.dao;
            const _data = this.data;
            this.form = await this.daoBuilder.getForm(this.schemaName);
            const form = this.form;
            this.dao.prepareToEdit(this.data?.data);
            if (this.form) this.dao.bindDataForm(this.data?.data, this.form);
            this.dao.confirmation(this.data?.data)?.subscribe(async data => {
                try {
                    if (this.data?.data && data) {
                        Object.assign(this.data?.data,
                            // await lastValueFrom(this.applicationService.sync({ body: { ...data, id: this.data?.id } }))
                        );
                        // delete (_data as IChangeable).__pre;
                        dao.prepareToEdit(_data);
                        if (form) dao.bindDataForm(_data, form);
                    }
                } catch (error) {
                }
            });
        }
    }
}