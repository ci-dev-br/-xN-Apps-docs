import { Component } from '@angular/core';
import { CoreModule } from '@ci/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { IFile } from './i-file';

@Component({
  selector: 'ci-files',
  standalone: true,
  imports: [
    CoreModule,
    MatTabsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './files.component.html',
  styleUrl: './files.component.scss'
})
export class FilesComponent {
  files?: IFile[];
}
