import { Component } from "@angular/core";
import { GridModule, IDataGridOptions } from "@ci/components";
import { CoreModule, DaoBuilder, ISchemaProperty } from "@ci/core";
import { Application } from "@ci/portal-api";

@Component({
    selector: 'ci-master-detail',
    standalone: true,
    imports: [
        CoreModule,
        GridModule,
    ],
    template: `
    <!-- TODO: Visualização em lista e em tabela permitindo visualização lateral ou em janela dos valores selecionados. -->
    <ci-data-grid [options]="gridOptions" [source]="source"></ci-data-grid>
    `
})
export class MasterDetailComponent {
    gridOptions?: IDataGridOptions<Application>;
    constructor(
        private readonly daoBuilder: DaoBuilder,
    ) {
        this.loadGrid();
    }
    source?: Application[];
    async loadGrid() {
        const properties = await (await this.daoBuilder.getSchema('Application')).properties
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
