import { Component } from '@angular/core';
import { CoreModule } from '@ci/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { IFile } from './i-file';
import { FileExplorerService } from '@ci/portal-api';
import { lastValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'ci-files',
  standalone: true,
  imports: [
    CoreModule,
    MatTabsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
  ],
  templateUrl: './files.component.html',
  styleUrl: './files.component.scss'
})
export class FilesComponent {
  files?: IFile[];
  constructor(
    private readonly fileExplorer: FileExplorerService,
  ) { }
  endereco?: string;

  async ir(endereco: string) {
    this.endereco = endereco;
    let files = (await lastValueFrom(this.fileExplorer.fileExplorerControllerReadDirectory({ body: { path: endereco } })));
    if (!!files)
      this.files = files.map(f => {
        return {
          icon: f.isDirectory ? 'folder' : f.isFile ? 'draft' : 'unknown_document',
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
}
