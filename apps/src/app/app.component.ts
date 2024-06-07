import { Component, OnInit } from '@angular/core';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'ci-root',
  standalone: true,
  imports: [RouterOutlet,
    MatIconModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'apps';
  constructor(
    private readonly matIconReg: MatIconRegistry,

  ) {

  }

  ngOnInit() {
    this.matIconReg.setDefaultFontSetClass('material-symbols-sharp')
  }

}
