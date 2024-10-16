import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { ActionModule, FileComponent } from '@ci/components';
import { CoreModule } from '@ci/core';
import { Form, FormsService } from '@ci/portal-api';
import { lastValueFrom } from 'rxjs';

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
    ActionModule,
    MatMenuModule,
    MatButtonModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  forms?: Form[];
  origin = location.origin;
  constructor(
    private readonly formsService: FormsService,
    private readonly router: Router,
  ) { }
  async ngOnInit() {
    this.find();
  }
  find() {
    this.formsService?.formsGetList({
      body: {
        take: 50, skip: 0,
      }
    }).subscribe(v => this.forms = v);
  }
  async criarFormulario() {
    if (!this.formsService) return;
    const form: Form = await lastValueFrom(this.formsService.formsSync({ body: { data: {} } })) as Form;
    if (form.internalId) this.openFormById(form.internalId);
  }
  openFormById(internalId: string) {
    setTimeout(() => {
      this.router.navigate(['Formularios', 'edit', internalId]);
    })
  }
  async remove(internalId: string) {
    await lastValueFrom(
      this.formsService.formsDelete({ body: { internalId } })
    );
    this.find();
  }
}
