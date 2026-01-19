import { Component } from '@angular/core';
import { CoreModule, IconLoaderSerices, LoadIconsModule } from '@ci/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { IArquivo } from './i-file';
import { FileExplorerService } from '@ci/portal-api';
import { lastValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'ci-files',
  imports: [
    CoreModule,
    MatTabsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    LoadIconsModule,
  ],
  standalone: true,
  templateUrl: './files.component.html',
  styleUrl: './files.component.scss'
})
export class FilesComponent {
  files?: IArquivo[];
  filteredFiles?: IArquivo[];
  constructor(
    private readonly fileExplorer: FileExplorerService,
    iconLoader: IconLoaderSerices,
  ) {
    iconLoader.load({
      'i8-folder': { url: '/icons8/icons8-folder.svg' },
    });
  }
  endereco?: string;
  private _filtrar?: string | undefined;
  public get filtrar(): string | undefined {
    return this._filtrar;
  }
  public set filtrar(value: string | undefined) {
    if (this._filtrar === value) return;
    this._filtrar = value;

    setTimeout(() => {
      if (value && value.trim().length > 0)
        this.filteredFiles = [...(this.files || [])]
          .filter(file => file && file.name && (file.name.indexOf(value) > -1 || RegExp(value).test(file.name)))
      else
        this.filteredFiles = [];
    })
  }
  async ir(endereco: string) {
    this.endereco = endereco;
    this.filteredFiles = undefined;
    let files = (await lastValueFrom(this.fileExplorer.fileExplorerControllerReadDirectory({ body: { path: endereco } })));
    if (!!files)
      this.files = files.map(f => {
        return {
          iconType: f.isDirectory ? 'svg' : undefined,
          icon: f.isDirectory ? 'i8-folder' : f.isFile ? 'draft' : 'unknown_document',
          name: f.name || 'UNKNOWN',
          info: f
        }
      })
  }
  async voltar() {
    let r = this.endereco?.replaceAll('\\', '/').split('/');
    r?.pop();
    this.ir(r?.join('/') || './')
  }

  async abrir(file: IArquivo) {
    if (file.info) {
      if (file.name?.indexOf('.') === -1) {
        this.ir(file.info.path + '/' + file.name);
      } else {

      }
    }
  }
}
