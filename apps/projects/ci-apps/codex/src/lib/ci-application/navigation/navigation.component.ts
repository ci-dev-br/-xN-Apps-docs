import { Component, EventEmitter } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CoreModule } from '@ci/core';
import { OpenProjectComponent } from '../open-project/open-project.component';
import { Files } from '../services/files.service';
import { FilesComponent, IArquivo } from '@ci-apps/Arquivos';

export interface IMenu {
  items: IMenuItem[];
}

export interface IMenuItem {
  label: string;
  icon?: string;
  action?: () => void;
}

@Component({
  selector: 'ci-navigation',
  standalone: true,
  imports: [
    CoreModule,
    RouterModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDialogModule,
  ],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss'
})
export class NavigationComponent {
  menuBar?: IMenu;
  abas?: { label: string, path: string, icon: string }[];
  private _arquivos?: IArquivo[] | undefined;
  public get arquivos(): IArquivo[] | undefined {
    if (this._arquivos === undefined && !!localStorage.getItem('::__arquivos_codex')) {
      try {
        const v = localStorage.getItem('::__arquivos_codex');
        if (v) this._arquivos = JSON.parse(v);
      } catch (error) {
        console.trace(error)
      }
    }
    return this._arquivos;
  }
  public set arquivos(value: IArquivo[] | undefined) {
    if (this._arquivos === value) return;
    this._arquivos = value;
    if (value)
      localStorage.setItem('::__arquivos_codex', JSON.stringify(value));
  }
  current?: IArquivo;
  constructor(
    private readonly route: ActivatedRoute,
    private readonly dialog: MatDialog,
    protected readonly files: Files,
  ) {

    this.abas = route.routeConfig?.children?.map(r => {
      return {
        label: (r?.data as any)?.title || r.path,
        path: '/' + r.path,
        icon: (r?.data as any)?.icon || undefined,
      } as { label: string, path: string, icon: string }
    }) || undefined;
  }
  items = [
    { titulo: "Criar novo Módulo" },
    { titulo: "Inspecionar Módulo" },
  ]
  openProject() {
    this.dialog.open(OpenProjectComponent, {
      data: {}
    })
  }

  async openFile() {
    const dialog_files = this.dialog.open(FilesComponent, {
      minHeight: '80vh',
      maxHeight: '95vh',
      minWidth: '95vw',
      data: {
        // acceptedFiles: ['.ts']
      }
    })
    dialog_files.afterClosed().subscribe(value => {
      try {
        if (value) this.arquivos = [value, ...(this.arquivos || [])];
        this.open(value);
      } catch (error) {
        console.trace(error)
      }
    });
  }
  open(arquivo: IArquivo) {
    this.current = arquivo;
    this.files.openFile(arquivo);
  }
}
