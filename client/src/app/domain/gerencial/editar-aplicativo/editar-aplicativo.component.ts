import { DIALOG_DATA } from '@angular/cdk/dialog';
import { Component, Inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Application } from 'src/app/api/models';

@Component({
  selector: 'ci-editar-aplicativo',
  templateUrl: './editar-aplicativo.component.html',
  styleUrls: ['./editar-aplicativo.component.scss']
})
export class EditarAplicativoComponent {
  form = this.fb.group({
    id: [, []],
    name: [, []],
    description: [, []],
    icon: [, []],
    url: [, []],
  });
  constructor(
    private readonly fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA)
    private readonly data?: Application,
  ) { }
}
