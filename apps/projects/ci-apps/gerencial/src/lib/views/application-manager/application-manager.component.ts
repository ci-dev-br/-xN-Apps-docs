import { Component } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIcon, MatIconModule } from "@angular/material/icon";
import { MatTableModule } from "@angular/material/table";
import { MatToolbarModule } from "@angular/material/toolbar";
import { Application, ApplicationService } from "@ci/portal-api";
import { CoreModule } from "@ci/core";
import { WindowService } from "@ci/components";
import { lastValueFrom } from "rxjs";
import { GridModule } from "@ci/components";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { FormsModule } from "@angular/forms";
import { IColumnOption } from "@ci/components";
import { EditarAplicativoComponent } from "../../editar-aplicativo/editar-aplicativo.component";
import { IItemAction } from "../../gerencial.component";
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
        GridModule,
        MatTooltipModule,
        MatButtonToggleModule,
        MatFormFieldModule,
        MatSelectModule,
        MatIconModule,
        FormsModule,
    ]
}) export class ApplicationManagerComponent {
    private _cached_map = new Map<string, any>();
    visualizacao: 'table' | 'list' = 'table';
    filtrarPapel?: string = 'all';
    apps?: Application[];
    // grid: 
    /* get displayedColumns() {
        return this.cache('displayedColumns', () => {
            return [...this.columns.filter(i => !i.hide).map(c => c.headerName), '_act']
        });
    } */
    /*  columns: IColumnOption[] = [
         { headerName: 'ID', fieldName: 'id', hide: true },
         { headerName: 'Nome ', fieldName: 'name' },
         { headerName: 'Ícone ', fieldName: 'icon', component: MatIcon },
         { headerName: 'Rota', fieldName: 'url' },
         { headerName: 'Descrição', fieldName: 'description' },
         { headerName: 'Grupo', fieldName: 'menuGroupName' },
         { headerName: 'Papéis', fieldName: 'roles' },
     ]; */
    /* actions: IItemAction<Application>[] = [
        {
            icon: 'edit',
            label: 'Editar',
            onAction: (i) => this.editar(i)
        },
        {
            icon: 'delete',
            label: 'Remover',
            onAction: (i) => this.remover(i)
        },
    ] */
    constructor(
        private readonly applications: ApplicationService,
        private readonly janela: WindowService,
        // private readonly liust: 
    ) {
        (async () => this.carregarListaAplicativos())();
    }
    private cache(prop: string, value: () => any) {
        if (!this._cached_map.has(prop))
            this._cached_map.set(prop, value());
        return this._cached_map.get(prop);
    }
    async novoAplicativo() {
        let app = {};
        const data = await this.editar(app);
        if (!!data?.id)
            this.apps = [data, ...this.apps || []];
    }
    async editar(application: Application) {
        return await this.janela.open(EditarAplicativoComponent, application)
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