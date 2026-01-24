import { AfterViewInit, Component, Inject, Injector, Input, OnInit, Optional } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatIconModule } from "@angular/material/icon";
import { MatToolbarModule } from "@angular/material/toolbar";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { GridModule, IColumnOption, IDataGridOptions, WindowModule, WindowService } from "@ci/components";
import { CoreModule, DaoBuilder, DaoService, IHaveSync, ISchema } from "@ci/core";
import { Application, getServiceAsSchema } from "@ci/portal-api";
import { EditarComponent } from "./editar/editar.component";
import { lastValueFrom } from "rxjs";
@Component({
    selector: 'ci-master-detail',
    standalone: true,
    imports: [
        CoreModule,
        GridModule,
        RouterModule,
        MatToolbarModule,
        MatButtonToggleModule,
        MatIconModule,
        MatButtonModule,
        WindowModule,
    ],
    templateUrl: 'master-detail.component.html',
    styleUrl: 'master-detail.component.scss'
})
export class MasterDetailComponent<T> implements OnInit, AfterViewInit {
    @Input()
    visualizationStage: 'table' | 'list' = 'table';
    @Input()
    schemaName?: string;
    @Input()
    gridOptions?: IDataGridOptions<Application>;
    service?: any;
    constructor(
        private readonly daoBuilder: DaoBuilder,
        private readonly route: ActivatedRoute,
        private readonly window: WindowService,
        private readonly injector: Injector,
        @Optional() private readonly daos?: DaoService,
    ) {

    }
    source?: T[] = [{} as any];
    properties?: ISchema;
    async loadGrid() {
        if (!!this.schemaName) {
            const properties = await (await this.daoBuilder.getSchema(this.schemaName)).properties
            this.properties = properties;
            this.gridOptions = {
                columns: [
                    ...Object.keys(properties || {}).map(property => {
                        const headerName = properties ? properties[property].title : property;
                        const fieldName = property;
                        return {
                            headerName,
                            fieldName,
                            hide: fieldName && [
                                'internalId',
                                'id',
                                'createdAt',
                                'createdBy',
                                'lastModifiedAt',
                                'lastModifiedBy',
                                'tenants',
                                'deleted'].indexOf(fieldName) !== -1

                        } as IColumnOption<any>
                    })
                ]
            };
            console.log(this.gridOptions);
        }
    }
    ngAfterViewInit(): void {
    }
    async ngOnInit() {
        this.route.data.subscribe(async (data: any) => {
            if (!!data.schema) {
                this.schemaName = data.schema;
                await this.load();
            }
        })
        this.route.paramMap.subscribe(async params => {
            const schema = params.get('EntityName');
            if (schema) {
                this.schemaName = schema;
                await this.load();
            }
        });
    }
    async load() {
        await this.loadGrid();
        if (!!this.schemaName) {
            let serviceType = getServiceAsSchema(this.schemaName);
            if (serviceType) {
                this.service = this.injector.get(serviceType);
            }
        }
        this.search();
    }
    async search() {
        if (this.service && this.service.getList)
            this.source = await this.daos?.read(await lastValueFrom(this.service.getList()), this.schemaName);
    }
    async editar(data: T, event?: Event) {
        return await this.window.open(EditarComponent,
            { schemaName: this.schemaName, data }, this.schemaName).finally(() => {
                this.search();
            })
    }
    async createNew() {
        let new_instance: T = {} as T;
        let new_instance_result: any = await lastValueFrom((this.service as IHaveSync<any>).sync({ body: { data: new_instance } }))
        /* const data =  */await this.editar(new_instance_result);
        /* if (!!data?.internalId || !!data?.id) // TODO: revisar esta regra
            this.source = [data, ...this.source || []];
        else {
            this.search();
        } */
    }
}
