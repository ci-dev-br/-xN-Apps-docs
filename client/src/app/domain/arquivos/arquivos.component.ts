import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Photo, PhotoService } from '@portal/api';
import { LNavModule } from 'src/app/components/l-nav/l-nav.module';


@Component({
  selector: 'ci-arquivos',
  standalone: true,
  imports: [
    MatIconModule,
    LNavModule,

  ],
  templateUrl: './arquivos.component.html',
  styleUrl: './arquivos.component.scss'
})
export class ArquivosComponent {
  photos?: Photo[];
  constructor(
    private readonly photoService: PhotoService,
  ) { }

  load() {
    // photos
    // this.photoService.
  }
}
