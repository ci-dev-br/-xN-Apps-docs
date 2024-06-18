import { Component } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatTableModule } from "@angular/material/table";
import { MatToolbarModule } from "@angular/material/toolbar";
import { CoreModule } from "@ci/core";
import { GridModule } from "@ci/components";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { FormsModule } from "@angular/forms";
import { User, UserService } from "@ci/portal-api";
import { lastValueFrom } from "rxjs";
import { ContainerModule } from "@ci/components";
@Component({
    selector: 'ci-users-view',
    template: `
    <mat-toolbar>
    
           <!--  <button mat-raised-button (click)="adicionar()">Cadastrar</button> -->
            <!-- <button mat-raised-button (click)="enviarConvite()" >enviarConvite</button> -->
    </mat-toolbar>
    <ci-container>
        <ci-data-grid></ci-data-grid>
    </ci-container>    
    `,
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
        ContainerModule,
    ]
}) export class UsersComponent {
    // private _cached_map = new Map<string, any>();
    // visualizacao: 'table' | 'list' = 'table';
    // filtrarPapel?: string = 'all';
    users?: User[];
    // get displayedColumns() {
    //     return this.cache('displayedColumns', () => {
    //         return [...this.columns.filter(i => !i.hide).map(c => c.headerName), '_act']
    //     });
    // }
    /// columns: IColumns[] = [
    ///     { headerName: 'ID', propertyName: 'id', hide: true },
    ///     { headerName: 'Nome ', propertyName: 'name' },
    ///     { headerName: 'Ícone ', propertyName: 'icon', component: MatIcon },
    ///     { headerName: 'Rota', propertyName: 'url' },
    ///     { headerName: 'Descrição', propertyName: 'description' },
    ///     { headerName: 'Grupo', propertyName: 'menuGroupName' },
    ///     { headerName: 'Papéis', propertyName: 'roles' },
    /// ];
    // actions: IItemAction<Application>[] = [
    //     {
    //         icon: 'edit',
    //         label: 'Editar',
    //         onAction: (i) => this.editar(i)
    //     },
    //     {
    //         icon: 'delete',
    //         label: 'Remover',
    //         onAction: (i) => this.remover(i)
    //     },
    // ]
    constructor(
        /// private readonly applications: ApplicationService,
        /// private readonly janela: WindowService,
        private readonly userService: UserService,
    ) {
        // (async () => this.carregarListaAplicativos())();
        (async () => this.find())();
    }
    async adicionar() {

    }
    async find() {
        this.users = await lastValueFrom(this.userService.userGetList());
    }

    // private cache(prop: string, value: () => any) {
    //     if (!this._cached_map.has(prop))
    //         this._cached_map.set(prop, value());
    //     return this._cached_map.get(prop);
    // }
    // async novoAplicativo() {
    //     let app = {};
    //     const data = await this.editar(app);
    //     if (!!data?.id)
    //         this.apps = [data, ...this.apps || []];
    // }
    // async editar(application: Application) {
    //     return await this.janela.open(EditarAplicativoComponent, application)
    // }
    // async remover(application: Application) {
    //     await lastValueFrom(this.applications.delete({ body: application }));
    //     let app = this.apps || [];
    //     app.splice(app.indexOf(application), 1);
    //     this.apps = [...app];
    // }
    // async carregarListaAplicativos() {
    //     this.apps = await lastValueFrom(this.applications.get({ body: { all: true } }));
    // }

}