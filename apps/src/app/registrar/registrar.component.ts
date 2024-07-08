import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Router, RouterModule } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { AuthService } from '@ci/portal-api';
import { AuthModule, UserService } from '@ci/auth';

@Component({
  selector: 'ci-registrar',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    RouterModule,
    AuthModule,
  ],
  templateUrl: './registrar.component.html',
  styleUrl: './registrar.component.scss'
})
export class RegistrarComponent {
  form: FormGroup = this.fb.group({
    identificacao: [, Validators.required],
    email: [, Validators.required],
    phone: [, Validators.required],
    password: [, Validators.required],
  });
  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly router: Router,
  ) { }
  year = (new Date()).getFullYear();
  validar() {
    return this.form.valid;
  }

  async confirmar() {
    if (!this.validar()) return this.form.markAllAsTouched();
    const user = await lastValueFrom(this.authService.registrar({ body: { ...this.form.getRawValue() } }));
    this.userService.identificarUsuario(user);
    setTimeout(() => this.router.navigate(['/']));
  }
}
