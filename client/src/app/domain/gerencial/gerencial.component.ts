import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { lastValueFrom } from 'rxjs';
import { Application } from '@portal/api';
import { ApplicationService } from '@portal/api';
import { TokenService } from 'src/app/core/token.service';
import { EditarAplicativoComponent } from './editar-aplicativo/editar-aplicativo.component';
import { JanelaService } from 'src/app/components/janela/janela.service';
import { MatIcon } from '@angular/material/icon';
import { IColumns } from 'src/app/components/grid/cell-renderer/cell-renderer.component';

export interface IItemAction<T> {
  label?: string;
  icon?: string;
  onAction?: (item: T) => void;
}

@Component({
  selector: 'ci-gerencial',
  templateUrl: './gerencial.component.html',
  styleUrls: ['./gerencial.component.scss']
})
export class GerencialComponent {
  visualizacao: 'table' | 'list' = 'table';
  apps?: Application[];
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
  columns: IColumns[] = [
    { headerName: 'ID', propertyName: 'id', hide: true },
    { headerName: 'Nome ', propertyName: 'name' },
    { headerName: 'Ícone ', propertyName: 'icon', component: MatIcon },
    { headerName: 'Rota', propertyName: 'url' },
    { headerName: 'Descrição', propertyName: 'description' },
  ];
  get displayedColumns() {
    return this.cache('displayedColumns', () => {
      return [...this.columns.filter(i => !i.hide).map(c => c.headerName), '_act']
    });
  }
  constructor(
    private readonly dialog: MatDialog,
    private readonly tokenS: TokenService,
    private readonly applications: ApplicationService,
    private readonly janela: JanelaService,
  ) {
    this.carregarListaAplicativos();
  }
  get token() {
    return this.tokenS.Token;
  }
  conectarDispositivo() {

  }
  async carregarListaAplicativos() {
    this.apps = await lastValueFrom(this.applications.get({ getAll: false }));
  }
  private _cached_map = new Map<string, any>();
  private cache(prop: string, value: () => any) {
    if (!this._cached_map.has(prop))
      this._cached_map.set(prop, value());
    return this._cached_map.get(prop);
  }
  async novoAplicativo() {
    let app = {};
    const data = await this.editar(app);
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
}
