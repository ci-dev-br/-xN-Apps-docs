import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { IDataGridOptions } from "../models/i-data-grid-options";
import { DaoBuilder } from "@ci/core";


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

    constructor(
        //  private readonly applications: ApplicationService,
        // private readonly janela: WindowService,
        private readonly daoBuilder: DaoBuilder,
    ) {

    }
    async ngOnDestroy() {

    }
    async ngOnInit() {

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
}