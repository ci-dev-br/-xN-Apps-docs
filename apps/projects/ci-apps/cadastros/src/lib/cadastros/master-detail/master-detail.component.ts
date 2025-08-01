import { Component, Inject, Injector, Input, OnInit } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatIconModule } from "@angular/material/icon";
import { MatToolbarModule } from "@angular/material/toolbar";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { GridModule, IColumnOption, IDataGridOptions, WindowModule, WindowService } from "@ci/components";
import { CoreModule, DaoBuilder } from "@ci/core";
import { Application, getServiceAsSchema } from "@ci/portal-api";
import { EditarComponent } from "./editar/editar.component";

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
    template: `
    <mat-toolbar [auto-scroll]="'horizontal'">
         {{schemaName || ''}}
    <button mat-raised-button (click)="createNew()" >
        Novo
    </button>
    <span style="flex:auto"></span>
    <mat-button-toggle-group >
        <mat-button-toggle value="table"><mat-icon>view_list</mat-icon>Tabela</mat-button-toggle>
        <mat-button-toggle value="list"><mat-icon>grid_view</mat-icon>Lista</mat-button-toggle>
    </mat-button-toggle-group>
</mat-toolbar>
    <!-- TODO: Visualização em lista e em tabela permitindo visualização lateral ou em janela dos valores selecionados. -->
    @if(visualizacao === 'table'){
    <ci-data-grid [options]="gridOptions" [source]="source"></ci-data-grid>
    }
    `
})
export class MasterDetailComponent<T> implements OnInit {
    @Input()
    visualizacao: 'table' | 'list' = 'table';
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
    ) {

    }
    source?: T[] = [{} as any];
    async loadGrid() {
        if (!!this.schemaName) {
            const properties = await (await this.daoBuilder.getSchema(this.schemaName)).properties
            this.gridOptions = {
                columns: [
                    ...Object.keys(properties || {}).map(property => {
                        const headerName = properties ? properties[property].title : property;
                        const fieldName = property;
                        return {
                            headerName,
                            fieldName,
                            hide: fieldName && ['internalId', 'id'].indexOf(fieldName) > -1

                        } as IColumnOption<any>
                    })
                ]
            }
        }
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
    }
    async editar(data: T) {
        return await this.window.open(EditarComponent,
            { schemaName: this.schemaName, data }, this.schemaName)
    }
    async createNew() {
        let new_instance: T = {} as T;
        const data = await this.editar(new_instance);
        if (!!data?.internalId || !!data?.id) // TODO: revisar esta regra
            this.source = [data, ...this.source || []];
    }
}
