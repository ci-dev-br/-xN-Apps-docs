import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
@Component({
  selector: 'ci-acessar',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './acessar.component.html',
  styleUrl: './acessar.component.scss'
})
export class AcessarComponent {
  stage?: 'identification' | 'loading' | 'captcha' | 'authentication' = 'identification';
  form?: FormGroup;
  constructor(
    private readonly fb: FormBuilder,
  ) {
    if (this.stage) this.criarFormulario(this.stage)
  }
  private criarFormulario(stage: 'identification' | 'loading' | 'captcha' | 'authentication') {
    this.form = this.fb.group({
      ...(stage === 'identification' ? {
        identification: [, []],
      } : {}),
      ...(stage === 'authentication' ? {
        password: [, []],
      } : {}),
    });
  }
  async submit() {

  }
}
