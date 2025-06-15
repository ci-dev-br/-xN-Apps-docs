import { Component, HostListener, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar'
import { DaoService, IChangeable } from '@ci/core';
import { Forms, FormsService, Pergunta } from '@ci/portal-api';
import { lastValueFrom } from 'rxjs';
@Component({
  selector: 'ci-edit',
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss',
  standalone: false
})
export class EditComponent implements OnInit {
  private _formulario?: Forms | undefined;
  public get formulario(): Forms | undefined {
    return this._formulario;
  }
  @Input()
  public set formulario(value: Forms | undefined) {
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
    this.formsService.getByInternalId({ body: { internalId: this.route.snapshot.paramMap.get('FormId') } }).subscribe(form_data => {
      this.formulario = form_data;
      this.daos.prepareToEdit(this.formulario);
      this.daos.bindDataForm(this.formulario, this.formGroup);
      this.daos.confirmation(this.formulario)?.subscribe(async data => {
        try {
          if (this.formulario && data) {
            let _data: any = Object.assign(this.formulario,
              await lastValueFrom(this.formsService.sync({ body: { data: data } }))
            );
            delete (_data as IChangeable).__pre;
            this.daos.prepareToEdit(_data);
            this.daos.bindDataForm(_data, this.formGroup);
          }
        } catch (error) {
          console.error(error);
        }
      })
    });
  }
  get changes() {
    if (!!this.formulario)
      return this.daos.getChanges(this.formulario as IChangeable);
    else return undefined;
  }
  @HostListener('keydown', ['$event'])
  shortcutKeyHandler(event: KeyboardEvent) {
    if (event.ctrlKey && event.code === 'KeyS') {
      this.confirm();
      event.preventDefault();
    }
  }
  async confirm() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      this.snap.open('Alguns campos precisam ser corrigidos...')
      return;
    }
    await this.daos.confirmChanges(this.formulario);
    this.snap.open('Alterações confirmadas', 'Ver Histórico')
  }
  async adicionarPergunta() {
    if (this.formulario) {
      if (!this.formulario.perguntas) this.formulario.perguntas = { perguntas: [] };
      this.formulario.perguntas.perguntas?.push({
        questao: ''
      });
      this.formulario.perguntas.perguntas = [...(this.formulario.perguntas.perguntas || [])];
    }
  }
  async removerPergunta(pergunta: Pergunta) {
    if (this.formulario?.perguntas?.perguntas) {
      let pos = this.formulario?.perguntas?.perguntas.indexOf(pergunta);
      if (pos > -1) {
        this.formulario.perguntas.perguntas.splice(pos, 1);
        this.formulario.perguntas.perguntas = [...this.formulario.perguntas.perguntas];
      }
    }
  }
  async compartilhar() {

  }
}
