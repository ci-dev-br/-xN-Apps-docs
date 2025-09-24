import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Router, RouterModule } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { AuthService } from '@ci/portal-api';
import { AuthModule, UserService } from '@ci/auth';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { FooterModule } from '@ci/components';

@Component({
  selector: 'ci-registrar',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    RouterModule,
    AuthModule,
    NgxMaskDirective,
    FooterModule,
  ],
  providers: [provideNgxMask()],
  standalone: true,
  templateUrl: './registrar.component.html',
  styleUrl: './registrar.component.scss'
})
export class RegistrarComponent {
  form = this.fb.group<{
    email: any,
  }>({
    email: [, [Validators.required, Validators.email]],
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

  async next() {
    if (!this.validar()) return this.form.markAllAsTouched();
    const user = await lastValueFrom(this.authService.registrar({ body: { ...(this.form.getRawValue() as any) } }));
    this.userService.identificarUsuario(user);
  }
}
