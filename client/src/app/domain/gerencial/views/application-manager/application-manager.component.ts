import { Component } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIcon, MatIconModule } from "@angular/material/icon";
import { MatTableModule } from "@angular/material/table";
import { MatToolbarModule } from "@angular/material/toolbar";
import { Application, ApplicationService } from "@portal/api";
import { IColumns } from "src/app/components/grid/cell-renderer/cell-renderer.component";
import { CoreModule } from "src/app/core/core.module";
import { EditarAplicativoComponent } from "../../editar-aplicativo/editar-aplicativo.component";
import { WindowService } from "src/app/components/window/window.service";
import { lastValueFrom } from "rxjs";
import { IItemAction } from "../../gerencial.component";
import { GridModule } from "src/app/components/grid/grid.module";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { FormsModule } from "@angular/forms";
@Component({
    selector: 'ci-application-manager',
    template: `
      <mat-toolbar>
            <button mat-raised-button (click)="novoAplicativo()">
                Novo
            </button>
            <mat-form-field>
                <mat-label>Filtrar por Papel</mat-label>
                <mat-select [(ngModel)]="filtrarPapel">
                    <mat-option value="all">Todos os Papéis</mat-option>
                </mat-select>
            </mat-form-field>
            <span style="flex:auto"></span>
            <!-- <button mat-icon-button matTooltip="Visualização em lista ">
                <mat-icon>view_list</mat-icon>
            </button> -->
            <!-- <button mat-icon-button matTooltip="Visualização em lista ">
                <mat-icon>grid_view</mat-icon>
            </button> -->
            <mat-button-toggle-group [(ngModel)]="visualizacao">
                <mat-button-toggle value="table"><mat-icon>view_list</mat-icon>Tabela</mat-button-toggle>
                <mat-button-toggle value="list"><mat-icon>grid_view</mat-icon>Lista</mat-button-toggle>
            </mat-button-toggle-group>
        </mat-toolbar>
        <ng-container *ngIf="apps">
            <table *ngIf="visualizacao==='table'" mat-table class="mat-elevation-z8" [dataSource]="apps">
                <ng-container *ngFor="let c of columns">
                    <ng-container [matColumnDef]="c.headerName">
                        <th mat-header-cell *matHeaderCellDef>{{c.headerName}}</th>
                        <td mat-cell *matCellDef="let element">
                            <px-cell-renderer [data]="element" [column]="c">

                            </px-cell-renderer>
                        </td>
                    </ng-container>
                </ng-container>
                <ng-container>
                    <ng-container matColumnDef="_act">
                        <th mat-header-cell *matHeaderCellDef>Ações</th>
                        <td mat-cell class="acoes" *matCellDef="let element">
                            <span class="row">
                                <button mat-icon-button *ngFor="let act of actions" (click)="act?.onAction(element)"
                                    [matTooltip]="act?.label || ''">
                                    <mat-icon>{{act.icon}}</mat-icon>
                                </button>
                            </span>
                        </td>
                    </ng-container>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
            </table>
            <div *ngIf="visualizacao==='list'" class="apps">
                <ng-container *ngFor="let item of apps">
                    <div class="card app">
                        <ng-container *ngIf="item.icon">
                            <mat-icon>{{item.icon}}</mat-icon>
                        </ng-container>
                        <ng-container *ngIf="item.name">
                            {{item.name}}
                        </ng-container>
                        <div class="row">
                            <button mat-icon-button (click)="editar(item)" matTooltip="Editar">
                                <mat-icon>edit</mat-icon>
                            </button>
                            <button mat-icon-button (click)="remover(item)" matTooltip="Remover">
                                <mat-icon>delete</mat-icon>
                            </button>
                        </div>
                    </div>
                </ng-container>
            </div>
        </ng-container>
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
    ]
}) export class ApplicationManagerComponent {
    private _cached_map = new Map<string, any>();
    visualizacao: 'table' | 'list' = 'table';
    filtrarPapel?: string = 'all';
    apps?: Application[];
    get displayedColumns() {
        return this.cache('displayedColumns', () => {
            return [...this.columns.filter(i => !i.hide).map(c => c.headerName), '_act']
        });
    }
    columns: IColumns[] = [
        { headerName: 'ID', propertyName: 'id', hide: true },
        { headerName: 'Nome ', propertyName: 'name' },
        { headerName: 'Ícone ', propertyName: 'icon', component: MatIcon },
        { headerName: 'Rota', propertyName: 'url' },
        { headerName: 'Descrição', propertyName: 'description' },
        { headerName: 'Grupo', propertyName: 'menuGroupName' },
        { headerName: 'Papéis', propertyName: 'roles' },
    ];
    actions: IItemAction<Application>[] = [
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
    ]
    constructor(
        private readonly applications: ApplicationService,
        private readonly janela: WindowService,
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