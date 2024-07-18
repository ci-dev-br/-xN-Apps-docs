import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs'
import { CodeComponent } from './code/code.component';
import { BlocksMakerComponent } from './blocks-maker/blocks-maker.component';
import { NodeRedComponent } from './node-red/node-red.component';
@Component({
  selector: 'ci-home',
  standalone: true,
  imports: [
    MatTabsModule,
    CodeComponent,
    BlocksMakerComponent,
    NodeRedComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
