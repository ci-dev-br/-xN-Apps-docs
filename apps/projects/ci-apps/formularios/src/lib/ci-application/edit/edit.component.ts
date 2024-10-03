import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar'
import { DaoService } from '@ci/core';
import { Form, FormsService } from '@ci/portal-api';
@Component({
  selector: 'ci-edit',
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss'
})
export class EditComponent implements OnInit {
  private _formulario?: Form | undefined;
  public get formulario(): Form | undefined {
    return this._formulario;
  }
  @Input()
  public set formulario(value: Form | undefined) {
    if (this._formulario === value) return;
    this._formulario = value;

  }
  formGroup: FormGroup = this.formBuilder.group({
    title: [, [Validators.required]],
    description: [, [Validators.required]],
  });
  constructor(
    private readonly formsService: FormsService,
    private readonly route: ActivatedRoute,
    private readonly formBuilder: FormBuilder,
    private readonly daos: DaoService,
    private readonly snap: MatSnackBar,
  ) { }
  async ngOnInit() {
    this.formsService.formsGetByInternalId({ body: { internalId: this.route.snapshot.paramMap.get('FormId') } }).subscribe(form_data => {
      this.formulario = form_data;
      this.daos.prepareToEdit(this.formulario);
      this.daos.bindDataForm(this.formulario, this.formGroup);
      this.daos.confirmation(this.formulario)?.subscribe(r => {
        console.log(r);
      })
    });
  }
  async confirm() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      this.snap.open('Alguns campos precisam ser corrigidos...')
      return;
    }
  }
}
