import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { GridModule, IDataGridOptions } from "@ci/components";
import { CoreModule, DaoBuilder } from "@ci/core";
import { Application } from "@ci/portal-api";

@Component({
    selector: 'ci-master-detail',
    standalone: true,
    imports: [
        CoreModule,
        GridModule,
        RouterModule,
    ],
    template: `
    {{schemaName || ''}}
    <!-- TODO: Visualização em lista e em tabela permitindo visualização lateral ou em janela dos valores selecionados. -->
    <ci-data-grid [options]="gridOptions" [source]="source"></ci-data-grid>
    `
})
export class MasterDetailComponent<T> implements OnInit {
    @Input()
    schemaName?: string;
    gridOptions?: IDataGridOptions<Application>;
    constructor(
        private readonly daoBuilder: DaoBuilder,
        private readonly route: ActivatedRoute,
    ) {
    }
    source?: T[] = [];
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
                            fieldName
                        }
                    })
                ]
            }
        }
    }
    async ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.schemaName = params.get('EntityName') || undefined;
            this.loadGrid();
        });
    }
}
