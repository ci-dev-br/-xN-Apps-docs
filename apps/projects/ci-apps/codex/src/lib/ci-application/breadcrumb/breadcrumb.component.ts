import { Component, Input, OnChanges, SimpleChanges, HostListener } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { CoreModule } from '@ci/core';
import { FileDto, FileExplorerService, ReadDirectoryOutput } from '@ci/portal-api';
import { lastValueFrom } from 'rxjs';
export interface IFile extends ReadDirectoryOutput {
  name?: string;
  path?: string;
  list?: (IFile | ReadDirectoryOutput)[];
}
@Component({
  selector: 'ci-breadcrumb',
  imports: [
    CoreModule,
    MatMenuModule,
  ],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss',
})
export class BreadcrumbComponent implements OnChanges {
  private _oppenedFile?: FileDto | undefined;
  public get oppenedFile(): FileDto | undefined {
    return this._oppenedFile;
  }
  @Input()
  public set oppenedFile(value: FileDto | undefined) {
    if (this._oppenedFile === value) return;
    this._oppenedFile = value;
    this.load();
  }
  constructor(
    private readonly explorer: FileExplorerService,
  ) { }
  load() {
    this.paths = this.oppenedFile?.path?.replaceAll('\\', '/').split('/').map((path, i, arr) => ({
      name: path,
      path: (() => {
        let a = [...arr];
        a.length = i + 1;
        return a.join('/');
      })(),
      //  list: [],
    }));
    this.paths;
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.load()
  }
  paths?: IFile[];
  async loadMenu(menu: any) {
    menu;
    const dir = await lastValueFrom(this.explorer.readDirectory({
      body: {
        path: menu.isDirectory !== undefined /* disctinct ifile >-< ReadDirectoryOutput */ ? menu.path + '/' + menu.name : menu.path?.substring(0, menu.path.lastIndexOf('/'))
      }
    })
    );
    if (dir) {
      menu.list = dir
      // old - menu.list = dir.map(el => el.name || '')
      /*.map(el => ({
        name: el.name
      }))*/
    }
  }
 
}
