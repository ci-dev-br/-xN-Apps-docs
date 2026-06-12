import { Component, Optional, OnInit, OnDestroy } from '@angular/core';
import { CoreModule, IconLoaderSerices, LoadIconsModule } from '@ci/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FileExplorerService } from '@ci/portal-api';
import { lastValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IArquivo } from './i-file';
import {MatSelectModule} from '@angular/material/select';
import {MatAutocompleteModule} from '@angular/material/autocomplete';

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
    RouterModule,
    MatSelectModule,
    MatAutocompleteModule,
  ],
  standalone: true,
  templateUrl: './files.component.html',
  styleUrl: './files.component.scss'
})
export class FilesComponent implements OnInit, OnDestroy {
  historico?: string[];
  files?: IArquivo[];
  navegacao?: string[];
  filteredFiles?: IArquivo[];
  constructor(
    private readonly fileExplorer: FileExplorerService,
    iconLoader: IconLoaderSerices,
    @Optional() private readonly dialogRef: MatDialogRef<FilesComponent, IArquivo>,
    @Optional() private readonly activatedRoute?: ActivatedRoute,
    @Optional() private readonly router?: Router,
  ) {
    iconLoader.load({
      'i8-folder': { url: '/icons8/icons8-folder.svg' },
      'i8-file': { url: '/icons8/icons8-file.svg' },
    });
    activatedRoute?.queryParams.subscribe(async (query: any) => {
      if (query) { }
      /// if (query.file) {
      ///   const file_loaded = await lastValueFrom(this.fileExplorer.readFile({
      ///     body: {
      ///       path: query.file
      ///     }
      ///   }));
      ///   // this.oppenedFile = file_loaded;
      ///   // this.value = file_loaded.data as string;
      /// }
    })
  }
  endereco?: string;
  ngOnInit() {
    const historico = localStorage.getItem('Arquivos.HistoryFiles')
    const ultimo_endereco = localStorage.getItem('Arquivos.Endereco');
    if (historico) {
      this.historico = JSON.parse(historico);
    }
    if (!!ultimo_endereco) {
      this.endereco = JSON.parse(ultimo_endereco);
      this.ir(this.endereco!);
    }
  }
  ngOnDestroy() {
    localStorage.setItem('Arquivos.Endereco', JSON.stringify(this.endereco))
    if (!!this.historico) localStorage.setItem('Arquivos.HistoryFiles', JSON.stringify(this.historico))
  }
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
    const endereco_anterior = this.endereco;
    try {
      let endereco_novo = endereco;
      this.endereco = endereco;
      this.filteredFiles = undefined;
      let files = (await lastValueFrom(this.fileExplorer.fileExplorerControllerReadDirectory({ body: { path: endereco } })));
      if (!this.historico) this.historico = [];
      this.historico.push(endereco_novo);
      if (!this.navegacao) this.navegacao = [];
      this.navegacao.push(endereco);

      if (!!files)
        this.files = files.map(f => {
          return {
            iconType: 'svg',
            icon: f.isDirectory ? 'i8-folder' : f.isFile ? 'i8-file' : 'unknown_document',
            name: f.name || 'UNKNOWN',
            info: f
          }
        })
    } catch (error) {
      console.trace(error);
      this.endereco = endereco_anterior;
    }
  }
  async voltar() {
    if (this.endereco && (this.endereco?.lastIndexOf('./') === (this.endereco.length - 2))) {
      return this.ir(this.endereco + '../');
    }
    let r = this.endereco?.replace(/\\/g, '/').split('/');
    r?.pop();
    this.ir(r?.join('/') || './')
  }

  async abrir(file: IArquivo) {
    if (file.info) {
      if (file.name?.indexOf('.') === -1) {
        this.ir(file.info.path + '/' + file.name);
      } else {
        if (!!this.dialogRef && !!file) {
          this.dialogRef.close(file);
        } else if (!!this.activatedRoute) {
          let painel = await this.router?.config[4]?.loadChildren!();
          if (painel) {
            painel;
          }
        }
      }
    }
  }
  back() {
    if (!!this.navegacao) {
      this.navegacao.splice(this.navegacao.length - 1, 1);
      this.ir(this.navegacao[this.navegacao.length - 1]);
    }
  }
  forward() {

  }
}
