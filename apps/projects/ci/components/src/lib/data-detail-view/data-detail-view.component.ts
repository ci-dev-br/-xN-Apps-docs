import { Component, Injector, Input, OnDestroy, OnInit, Type } from "@angular/core";
import { IDataGridOptions } from "../models/i-data-grid-options";
import { DaoBuilder, IHaveSync } from "@ci/core";
import { getServiceAsSchema } from "@ci/portal-api";


@Component({
    selector: 'ci-data-detail-view',
    standalone: false,
    templateUrl: 'data-detail-view.component.html',
    styleUrl: 'data-detail-view.component.scss',
}) export class DataDetailViewComponent<I> implements OnInit, OnDestroy {
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
        //  private readonly applications: ApplicationService,
        // private readonly janela: WindowService,
        private readonly daoBuilder: DaoBuilder,
        private readonly injector: Injector,
    ) {
    }
    async ngOnDestroy() {

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
        this.gridOptions = {
            columns: [
                ...Object.keys(properties || {}).map(property => {
                    const headerName = properties ? properties[property].title : property;
                    const fieldName = property;
                    return {
                        headerName,
                        fieldName
                    }
                })
            ]
        }
    }
    async carregarLista() {
        //  this.list = await lastValueFrom();
    }
    async createNew() {
        if (this.service && this.service.sync) {
            /// (this.service.sync as IHaveSync<I>).sync({ body: { data } })
        }
    }
}