import { Component, OnInit } from '@angular/core';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { RouterOutlet } from '@angular/router';
import { CoreModule, CoreService } from '@ci/core';

@Component({
  selector: 'ci-root',
  standalone: true,
  imports: [
    CoreModule,
    RouterOutlet,
    MatIconModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'apps';
  constructor(
    private readonly matIconReg: MatIconRegistry,
    private readonly core: CoreService,
  ) { }
  ngOnInit() {
    this.matIconReg.setDefaultFontSetClass('material-symbols-sharp')
  }

}
