import { Token } from '@angular/compiler';
import { Component, Type } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { lastValueFrom } from 'rxjs';
import { Application } from 'src/app/api/models';
import { ApplicationService } from 'src/app/api/services';
import { TokenService } from 'src/app/core/token.service';
import { EditarAplicativoComponent } from './editar-aplicativo/editar-aplicativo.component';
import { JanelaService } from 'src/app/components/janela/janela.service';


export interface IColumns {
  headerName: string;
  propertyName: string;
  componentType?: Type<any>
}

@Component({
  selector: 'ci-gerencial',
  templateUrl: './gerencial.component.html',
  styleUrls: ['./gerencial.component.scss']
})
export class GerencialComponent {
  apps?: Application[];
  columns: IColumns[] = [
    { headerName: 'ID', propertyName: 'id' },
    { headerName: 'Nome ', propertyName: 'name' },
    { headerName: 'Ícone ', propertyName: 'icon' },
    { headerName: 'URL', propertyName: 'url' },
    { headerName: 'Descrição', propertyName: 'description' },
  ];
  get displayedColumns() {
    return this.cache('displayedColumns', () => { return this.columns.map(c => c.headerName) });
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
    this.apps = await lastValueFrom(this.applications.get());
  }
  private _cached_map = new Map<string, any>();
  private cache(prop: string, value: () => any) {
    if (!this._cached_map.has(prop))
      this._cached_map.set(prop, value());
    return this._cached_map.get(prop);
  }
  async novoAplicativo() {
    const data = await this.editar({});
  }
  async editar(application: Application) {
    return await this.janela.open(EditarAplicativoComponent)
  }
}
