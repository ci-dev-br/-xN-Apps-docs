import { AfterViewInit, Component, Injector, Input, OnDestroy, OnInit, Optional, Type } from "@angular/core";
import { IDataGridOptions } from "../models/i-data-grid-options";
import { DaoBuilder, DaoService, IHaveGetList, IHaveSync } from "@ci/core";
import { getServiceAsSchema } from "@ci/portal-api";
import { lastValueFrom } from "rxjs";
import { WindowService } from "../window/window.service";
import { ActivatedRoute } from "@angular/router";
import { EditarComponent } from "../editar-detail/editar.component";


@Component({
    selector: 'ci-data-detail-view',
    standalone: false,
    templateUrl: 'data-detail-view.component.html',
    styleUrl: 'data-detail-view.component.scss',
}) export class DataDetailViewComponent<I> implements OnInit, OnDestroy, AfterViewInit {
    @Input() schemaName?: string;
    @Input()
    list?: I[];
    @Input()
    visualizacao: 'table' | 'list' = 'table';
    @Input()
    gridOptions?: IDataGridOptions<I>;
    @Input()
    service?: any;

    constructor(
        private readonly daoBuilder: DaoBuilder,
        private readonly injector: Injector,
        @Optional() private readonly route?: ActivatedRoute,
        @Optional() private readonly window?: WindowService,
        @Optional() private readonly daos?: DaoService,
    ) {
    }
    async ngOnDestroy() {
        // TODO: 
    }
    ngAfterViewInit(): void {
        this.loadDataList();
    }
    async ngOnInit() {
        if (this.schemaName) {
            let service = getServiceAsSchema(this.schemaName);
            if (!!service) {
                this.service = this.injector.get(service);
            }
        }
        this.loadGrid();
    }
    async loadGrid() {
        if (!this.schemaName) return;
        const properties = await (await this.daoBuilder.getSchema(this.schemaName)).properties
        const hidden_columns = ['internalId', 'createdAt', 'createdBy', 'lastModifiedAt', 'lastModifiedBy', 'deleted', 'tenants'];
        this.gridOptions = {
            columns: [
                ...Object.keys(properties || {}).filter(col => hidden_columns.indexOf(col) === -1).map(property => {
                    const headerName = properties ? properties[property].title : property;
                    const fieldName = property;
                    return {
                        headerName,
                        fieldName
                    }
                })
            ]
        };
    }
    async loadDataList() {
        this.list = await lastValueFrom(
            (this.service as IHaveGetList<I>).getList({ body: {} })
        );
    }
    async editar(data: I, event?: Event) {
        const result: number | any = await this.window?.open(EditarComponent,
            { schemaName: this.schemaName, data },
            this.schemaName, event)
        if (result === -1 && this.list) {
            let pos = this.list.indexOf(data);
            this.list?.splice(pos, 1);
        }
    }
    async createNew() {
        if (this.service && this.service.sync) {
            // (this.service.sync as IHaveSync<I>).sync({ body: { data } });
            let instance: I = {} as I;
            const data: number | any = await this.editar(instance);
            if (!(typeof data === 'number') && (!!data?.internalId || !!data?.id))
                this.list = [data, ...this.list || []];
        }
    }
}