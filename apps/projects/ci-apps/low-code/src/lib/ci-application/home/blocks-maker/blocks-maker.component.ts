import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CoreModule } from '@ci/core';

@Component({
  selector: 'ci-blocks-maker',
  standalone: true,
  imports: [
    CoreModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatToolbarModule,
  ],
  templateUrl: './blocks-maker.component.html',
  styleUrl: './blocks-maker.component.scss'
})
export class BlocksMakerComponent {
  blocos?: any[]
}
