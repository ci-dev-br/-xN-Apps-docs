import { AfterViewInit, Component, Inject, Injector, Input, OnDestroy, OnInit } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatIconModule } from "@angular/material/icon";
import { MatToolbarModule } from "@angular/material/toolbar";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { GridModule, IColumnOption, IDataGridOptions, WindowModule, WindowService } from "@ci/components";
import { CoreModule, DaoBuilder, DaoService } from "@ci/core";
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
    styleUrl: 'master-detail.component.scss',
    template: `
<mat-toolbar [auto-scroll]="'horizontal'">
    <button mat-raised-button (click)="search()" >
        Pesquisar
    </button>
    <button mat-raised-button (click)="createNew()" >
        Novo
    </button>
    <span style="flex:auto"></span>
    <mat-button-toggle-group >
        <mat-button-toggle value="table"><mat-icon>view_list</mat-icon>Tabela</mat-button-toggle>
        <mat-button-toggle value="list"><mat-icon>grid_view</mat-icon>Lista</mat-button-toggle>
    </mat-button-toggle-group>
</mat-toolbar>
@if(visualizacao === 'table'){
    <ci-data-grid (select)="editar($event[0],$event[1])" [options]="gridOptions" [source]="source">
            <div vazio style="flex: auto; text-align: center;">Nenhum item cadastrado</div>
    </ci-data-grid>
}
    `
})
export class MasterDetailComponent<T> implements OnInit, AfterViewInit, OnDestroy {
    @Input()
    visualizacao: 'table' | 'list' = 'table';
    @Input()
    schemaName?: string;
    @Input()
    gridOptions?: IDataGridOptions<Application>;
    service?: any;
    constructor(
        private readonly daoBuilder: DaoBuilder,
        private readonly daos: DaoService,
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
                            hide: fieldName && ['internalId', 'id', 'createdAt', 'createdBy', 'lastModifiedAt', 'lastModifiedBy', 'tenants', 'deleted'].indexOf(fieldName) > -1

                        } as IColumnOption<any>
                    })
                ]
            }
        }
    }
    async ngAfterViewInit() {
        this.load();
    }
    private oTitle?: string;
    ngOnDestroy(): void {
        if (!!document && this.oTitle) document.title = this.oTitle;
    }
    async ngOnInit() {
        this.route.data.subscribe(async (data: any) => {
            if (!!data.schema) {
                this.schemaName = data.schema;
                if (!!document?.title && !this.oTitle) { this.oTitle = document.title; document.title = `${this.oTitle} - ${this.schemaName}` }
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
        this.source;
    }
    async search() {
        if (this.service && this.service.getList) this.source = await this.daos.read(await lastValueFrom(this.service.getList()));
    }
    async editar(data: T, event?: MouseEvent) {
        const result: number | any = await this.window.open(EditarComponent,
            { schemaName: this.schemaName, data }, this.schemaName, event)
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
