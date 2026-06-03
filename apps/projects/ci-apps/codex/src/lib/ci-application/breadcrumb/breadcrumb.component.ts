import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { CoreModule } from '@ci/core';
import { FileDto } from '@ci/portal-api';

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
  constructor() { }
  load() {
    this.paths = this.oppenedFile?.path?.replaceAll('\\', '/').split('/');
    this.paths;
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.load()
  }
  paths?: string[];
}
