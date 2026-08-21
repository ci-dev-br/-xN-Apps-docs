import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Objeto, ThrejsComponent } from '@ci/espazio';
@Component({
  selector: 'ci-home',
  imports: [
    ThrejsComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  protected isBrowser: boolean;
  objetos?: Objeto[];
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }
  ngOnInit() {
    // TODO: removido exemplo, carga deve ser realizada mediante requisição.
    /*  if (this.isBrowser) {
       this.objetos = [
         new Objeto({ glb_file: 'mapa_casa.glb' }),
       ];
     } */
  }
}

