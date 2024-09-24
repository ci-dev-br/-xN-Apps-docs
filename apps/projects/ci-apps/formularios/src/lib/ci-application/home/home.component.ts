import { Component, OnInit } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
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
