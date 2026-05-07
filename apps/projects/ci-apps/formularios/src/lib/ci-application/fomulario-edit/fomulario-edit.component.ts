import { Component, HostListener, Input, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { CoreModule, DaoService, IChangeable } from '@ci/core';
import { Forms, FormsService, Pergunta } from '@ci/portal-api';
import { lastValueFrom } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { InputModule, LogoComponent } from '@ci/components';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { PerguntaItemComponent } from '../pergunta-item/pergunta-item.component';
@Component({
  selector: 'ci-fomulario-edit',
  templateUrl: './fomulario-edit.component.html',
  styleUrl: './fomulario-edit.component.scss',
  standalone: true,
  imports: [
    CoreModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatTabsModule,
    InputModule,
    MatMenuModule,
    MatButtonModule,
    MatSnackBarModule,
    LogoComponent,
    MatIconModule,
    MatTooltipModule,
    MatMenuModule,
    PerguntaItemComponent,
  ]
})
export class FormularioEditComponent implements OnInit {
  private _formulario?: Forms | undefined;
  public get formulario(): Forms | undefined {
    return this._formulario;
  }
  @Input()
  public set formulario(value: Forms | undefined) {
    if (this._formulario === value) return;
    this._formulario = value;

  }
  formGroup?: FormGroup = this.formBuilder?.group({
    title: [, [Validators.required]],
    description: [, [Validators.required]],
  });
  constructor(
    @Optional() private readonly formsService?: FormsService,
    @Optional() private readonly route?: ActivatedRoute,
    @Optional() private readonly formBuilder?: FormBuilder,
    @Optional() private readonly daos?: DaoService,
    @Optional() private readonly snap?: MatSnackBar,
  ) { }
  async ngOnInit() {
    if (!!this.route && !!this.formsService) {
      this.formsService.getByInternalId({ body: { internalId: this.route.snapshot.paramMap.get('FormId') } }).subscribe(form_data => {
        this.formulario = form_data;
        this.daos?.prepareToEdit(this.formulario);
        if (this.formGroup) this.daos?.bindDataForm(this.formulario, this.formGroup);
        this.daos?.confirmation(this.formulario)?.subscribe(data => this.confirmationHandler(data))
      });
    }
  }
  private async confirmationHandler(data: any) {
    try {
      if (this.formsService && this.daos && this.formulario && data) {
        let _data: any = Object.assign(this.formulario,
          await lastValueFrom(this.formsService.sync({ body: { data: data } }))
        );
        delete (_data as IChangeable).__pre;
        this.daos.prepareToEdit(_data);
        if (this.formGroup) this.daos.bindDataForm(_data, this.formGroup);
      }
    } catch (error) {
      console.trace(error);
    }
  }
  get changes() {
    if (!!this.formulario && this.daos)
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
    // o front end pode determinar anteriormente se determinado fluxo é ilegal?
    /* if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      this.snap.open('Alguns campos precisam ser corrigidos...')
      return;
    } */
    await this.daos?.confirmChanges(this.formulario);
    this.snap?.open('Ajustado!', 'Visualizar histórico')
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
