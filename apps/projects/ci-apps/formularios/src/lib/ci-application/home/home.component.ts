import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { ActionModule, FileComponent } from '@ci/components';
import { CoreModule } from '@ci/core';
import { Forms, FormsService } from '@ci/portal-api';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'ci-home',
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
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  forms?: Forms[];
  origin = location.origin;
  constructor(
    private readonly formsService: FormsService,
    private readonly router: Router,
  ) { }
  async ngOnInit() {
    this.find();
  }
  find() {
    this.formsService?.getList({
      body: {
        take: 50, skip: 0,
      }
    }).subscribe(v => this.forms = v);
  }
  async criarFormulario() {
    if (!this.formsService) return;
    const form: Forms = await lastValueFrom(this.formsService.sync({ body: { data: {} as Forms } })) as Forms;
    if (form.internalId) this.openFormById(form.internalId);
  }
  openFormById(internalId: string) {
    setTimeout(() => {
      this.router.navigate(['Formularios', 'edit', internalId]);
    })
  }
  async remove(internalId: string) {
    await lastValueFrom(
      this.formsService.delete({ body: { internalId } })
    );
    this.find();
  }
}
