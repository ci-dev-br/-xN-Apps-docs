import { Component } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIcon, MatIconModule } from "@angular/material/icon";
import { MatTableModule } from "@angular/material/table";
import { MatToolbarModule } from "@angular/material/toolbar";
import { Application, ApplicationService } from "@ci/portal-api";
import { CoreModule, DaoBuilder } from "@ci/core";
import { DataListModule, WindowService, GridModule, IDataGridOptions, IColumnOption } from "@ci/components";
import { lastValueFrom } from "rxjs";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { FormsModule } from "@angular/forms";
import { EditarAplicativoComponent } from "../../editar-aplicativo/editar-aplicativo.component";
@Component({
    selector: 'ci-application-manager',
    templateUrl: 'application-manager.component.html',
    styleUrls: ['application-manager.component.scss'],
    standalone: true,
    imports: [
        CoreModule,
        MatIconModule,
        MatToolbarModule,
        MatButtonModule,
        MatTableModule,
        MatTooltipModule,
        MatButtonToggleModule,
        MatFormFieldModule,
        MatSelectModule,
        MatIconModule,
        FormsModule,
        GridModule,
        DataListModule,
    ]
}) export class ApplicationManagerComponent {
    private _cached_map = new Map<string, any>();
    visualizacao: 'table' | 'list' = 'table';
    filtrarPapel?: string = 'all';
    apps?: Application[];
    gridOptions?: IDataGridOptions<Application>;
    constructor(
        private readonly applications: ApplicationService,
        private readonly janela: WindowService,
        private readonly daoBuilder: DaoBuilder,
    ) {
        (async () => this.loadGrid())();
        (async () => this.carregarListaAplicativos())();
    }
    private cache(prop: string, value: () => any) {
        if (!this._cached_map.has(prop))
            this._cached_map.set(prop, value());
        return this._cached_map.get(prop);
    }
    async novoAplicativo() {
        let newApplication = {};
        const data = await this.editar(newApplication);
        if (!!data?.id)
            this.apps = [data, ...this.apps || []];
    }
    async loadGrid() {
        const properties = await (await this.daoBuilder.getSchema('Application')).properties
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
    async editar(application: Application, event?: Event) {
        const result = await this.janela.open(EditarAplicativoComponent, application, 'Aplicativo', event)
        if (result === null) {
            const pos = this.apps?.indexOf(application);
            if (pos && pos > -1) {
                this.apps?.splice(pos, 1);
                this.apps = [...(this.apps || [])]
            }
        }
        return result;
    }
    async remover(application: Application) {
        await lastValueFrom(this.applications.delete({ body: application }));
        let app = this.apps || [];
        app.splice(app.indexOf(application), 1);
        this.apps = [...app];
    }
    async carregarListaAplicativos() {
        this.apps = await lastValueFrom(this.applications.get({ body: { all: true } }));
    }
}