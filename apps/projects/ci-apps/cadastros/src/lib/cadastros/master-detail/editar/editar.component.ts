import { Component, HostListener, Inject, Injector, Input, OnInit, Optional } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ActivatedRoute } from "@angular/router";
import { DynFormModule } from "@ci/components";
import { CORE_ENV, CoreModule, DaoBuilder, DaoService, IChangeable, ICoreEnvironment, IHaveSync, ISchemaPreset } from "@ci/core";
import { FormsService, getServiceAsSchema } from "@ci/portal-api";
import { lastValueFrom } from "rxjs";
export interface IDataEditar {
    data: any;
    schemaName: string;
}
@Component({
    standalone: true,
    imports: [
        CoreModule,
        ReactiveFormsModule,
        DynFormModule,
    ],
    selector: 'ci-master-datail--editar',
    templateUrl: 'editar.component.html',
    styleUrl: 'editar.component.scss'
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
    private async loadFormFromDaoBuilder() {
        if (this.schemaName) {
            await this.loadService();
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
                        } else if (this.service && this.service.sync) {
                            let r = await lastValueFrom((this.service as IHaveSync<any>).sync({ body: { data: this.data?.data } }))
                            r = r;
                        }
                        delete (_data as IChangeable).__pre;
                        dao.prepareToEdit(_data);
                        if (form) dao.bindDataForm(_data, form);
                    }
                } catch (error) {
                    console.error(error);
                }
            });
        }
    }
    @HostListener('window:keydown', ['$event'])
    protected save(event: KeyboardEvent) {
        if (!!event.ctrlKey && event.code === 'KeyS') {
            event.preventDefault();
            this.dao?.confirmChanges(!!this.data?.data?.schemaName ? this.data.data.data : this.data?.data)
        }
    }
}