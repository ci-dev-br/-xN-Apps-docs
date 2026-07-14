import { Component, OnInit, Optional } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { FileComponent } from '@ci/components';
import { ActionModule } from '@ci/components/action';
import { CoreModule } from '@ci/core';
import { Forms, FormsService } from '@ci/portal-api';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'ci-formulario-home',
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
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
  ],
  standalone: true,
  templateUrl: './formulario-home.component.html',
  styleUrl: './formulario-home.component.scss'
})
export class FormularioHomeComponent implements OnInit {
  forms?: Forms[];
  formsFiltrered?: Forms[];
  filtro = this.formBuilder.group({
    filtro: [, []]
  });
  origin = location.origin;
  constructor(
    private readonly formBuilder: FormBuilder,
    @Optional() private readonly formsService?: FormsService,
    @Optional() private readonly router?: Router,
  ) { }
  async ngOnInit() {
    this.find();
    this.filtro.valueChanges.subscribe((value) => {
      if (value.filtro) {
        const filtro: string = (value.filtro as string).toLowerCase();
        this.formsFiltrered = this.forms?.filter(forms => {
          return JSON.stringify(forms).toLowerCase().indexOf(filtro) > -1
        })
      } else this.formsFiltrered = undefined;
    })
  }
  find() {
    this.formsService?.getList({
      body: {
        //  take: 50, skip: 0,
      }
    }).subscribe(v => this.forms = v);
  }

  async loadMore() {

  }
  async criarFormulario() {
    if (!this.formsService) return;
    const form: Forms = await lastValueFrom(this.formsService.sync({ body: { data: {} as Forms } })) as Forms;
    if (form.internalId) this.openFormById(form.internalId);
  }
  openFormById(internalId: string) {
    setTimeout(() => {
      this.router?.navigate(['Formularios', 'edit', internalId]);
    })
  }
  async remove(internalId: string) {
    if (this.formsService)
      await lastValueFrom(
        this.formsService.delete({ body: { internalId } })
      );
    this.find();
  }
}
