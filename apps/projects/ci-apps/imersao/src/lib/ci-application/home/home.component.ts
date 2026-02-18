import { Component } from '@angular/core';
import { Objeto, ThrejsComponent } from '@ci/espazio';
@Component({
  selector: 'ci-home',
  imports: [
    ThrejsComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  objetos = [
    new Objeto({ glb_file: 'celula-000.glb' }),
  ]
}
