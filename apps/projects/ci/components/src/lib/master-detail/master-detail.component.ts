import { AfterViewInit, Component, Injector, Input, OnDestroy, OnInit, Optional } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatIconModule } from "@angular/material/icon";
import { MatToolbarModule } from "@angular/material/toolbar";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { GridModule, IColumnOption, IDataGridOptions, WindowModule, WindowService, } from "@ci/components";
import { CoreModule, DaoBuilder, DaoService, } from "@ci/core";
import { FormsModule } from "@angular/forms";
import { getServiceAsSchema } from "@ci/portal-api";
import { EditarComponent } from "./editar/editar.component";
import { lastValueFrom } from "rxjs";

@Component({
    selector: 'ci-master-detail',
    standalone: true,
    imports: [
        CoreModule,
        RouterModule,
        MatToolbarModule,
        MatButtonToggleModule,
        MatIconModule,
        MatButtonModule,
        // WindowModule,
        GridModule,
        // DataListModule,
        FormsModule,
    ],
    styleUrl: 'master-detail.component.scss',
    templateUrl: 'master-detail.component.html'
})
export class MasterDetailComponent<T> implements OnInit, AfterViewInit, OnDestroy {
    @Input()
    visualizacao?: 'table' | 'list' = 'table';
    @Input()
    schemaName?: string;
    @Input()
    gridOptions?: IDataGridOptions<T>;
    service?: any;
    constructor(
        @Optional() private readonly daoBuilder?: DaoBuilder,
        @Optional() private readonly daos?: DaoService,
        @Optional() private readonly route?: ActivatedRoute,
        @Optional() private readonly window?: WindowService,
        @Optional() private readonly injector?: Injector,
    ) { }
    source?: T[] = [{} as any];
    async loadGrid() {
        if (!!this.schemaName && this.daoBuilder) {
            const properties = await (await this.daoBuilder.getSchema(this.schemaName)).properties
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
                                'deleted'].indexOf(fieldName) > -1

                        } as IColumnOption<any>
                    })
                ]
            }
        }
    }
    async ngAfterViewInit() {
        if (!!this.schemaName) this.load();
    }
    private oTitle?: string;
    ngOnDestroy(): void {
        if (!!document && this.oTitle) document.title = this.oTitle;
    }
    async ngOnInit() {
        this.route?.data.subscribe(async (data: any) => {
            if (!!data.schema) {
                this.schemaName = data.schema;
                await this.load();
            }
        })
    }
    async load() {
        if (this.schemaName && !!document?.title && !this.oTitle && this.schemaName) {
            this.oTitle = document.title;
            document.title = `${this.oTitle} - ${this.schemaName}`
        }
        await this.loadGrid();
        if (!!this.schemaName) {
            let serviceType = getServiceAsSchema(this.schemaName);
            if (serviceType) {
                this.service = this.injector?.get(serviceType);
            }
        }
        this.search();
        this.source;
    }
    async search() {
        if (this.service && this.service.getList)
            this.source = await this.daos?.read(await lastValueFrom(this.service.getList()));
    }
    async editar(data: T, event?: Event) {
        const result: number | any = await this.window?.open(EditarComponent,
            { schgemaName: this.schemaName, data }, this.schemaName, event)
        if (result === -1 && this.source) {
            let pos = this.source.indexOf(data);
            this.source?.splice(pos, 1);
        }
    }
    async createNew() {
        let instance: T = {} as T;
        const data: number | any = await this.editar(instance);
        if (!(typeof data === 'number') && (!!data?.internalId || !!data?.id)) // TODO: revisar esta regra
            this.source = [data, ...this.source || []];
    }
}
