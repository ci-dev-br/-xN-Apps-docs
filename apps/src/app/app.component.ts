import { Component, OnInit } from '@angular/core';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { CoreModule, CoreService, WsService } from '@ci/core';

@Component({
  selector: 'ci-root',
  standalone: true,
  imports: [
    CoreModule,
    RouterOutlet,
    MatIconModule,
    RouterModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'apps';
  constructor(
    private readonly matIconReg: MatIconRegistry,
    private readonly core: CoreService,
    private readonly router: Router,
    private readonly ws: WsService,
  ) { }
  ngOnInit() {
    this.matIconReg.setDefaultFontSetClass('material-symbols-sharp')
    // this.router.events.subscribe(r => console.log(r))
  }

}
