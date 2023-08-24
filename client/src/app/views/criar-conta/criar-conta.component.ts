import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { AuthService } from 'src/app/api/services';

@Component({
  selector: 'ci-criar-conta',
  templateUrl: './criar-conta.component.html',
  styleUrls: ['./criar-conta.component.scss']
})
export class CriarContaComponent {
  form: FormGroup = this.fb.group({
    identificacao: [, [Validators.required, Validators.minLength(5)]],
    email: [, [Validators.email, Validators.required]],
    password: [, [Validators.required, Validators.minLength(5)]],
    phone: [, [Validators.required]],
  });
  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
  ) { }
  validar() {
    if (this.form.valid) return true;
    this.form.markAllAsTouched();
    return false;
  }
  async criarConta() {
    if (!this.validar()) return;
    const user = await lastValueFrom(this.authService.registrar({ body: { ...this.form.getRawValue() } }));
    console.log(user);
  }
}
