import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FileComponent } from '@ci/components';
import { CoreModule } from '@ci/core';
import { Form, FormsService } from '@ci/portal-api';

@Component({
  selector: 'ci-home',
  standalone: true,
  imports: [
    CoreModule,
    MatToolbarModule,
    FileComponent,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  fomrs?: Form[];
  constructor(
    private readonly forms?: FormsService,
  ) { }
  async ngOnInit() {
    this.find();
  }
  find() {
    this.forms?.formsGet({
      body: {
        take: 50, skip: 0,
      }
    }).subscribe(v => this.fomrs = v);
  }
}
