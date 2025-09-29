import { Component, EventEmitter } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Router, RouterModule } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { AuthService, Register, RegisterService } from '@ci/portal-api';
import { AuthModule, UserService } from '@ci/auth';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { FooterModule } from '@ci/components';
import { CoreModule, StageModule, StageService } from '@ci/core';

@Component({
  selector: 'ci-registrar',
  imports: [
    CoreModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    RouterModule,
    AuthModule,
    NgxMaskDirective,
    FooterModule,
    StageModule,
  ],
  providers: [provideNgxMask()],
  standalone: true,
  templateUrl: './registrar.component.html',
  styleUrl: './registrar.component.scss'
})
export class RegistrarComponent {
  stageOutput = new EventEmitter<string>();
  private _stage = 'initial-registring';
  public get stage() {
    return this._stage;
  }
  public set stage(value) {
    if (this._stage === value) return;
    this._stage = value;
    this.stageOutput.emit(value);
  }
  form = this.fb.group<{
    email: any,
    emailAuthorization: any,
  }>({
    email: [, [Validators.required, Validators.email]],
    emailAuthorization: [false, [Validators.required]],
  });
  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly router: Router,
    private readonly stages: StageService,
    private readonly regitrar: RegisterService,
  ) {
    stages.host = this;
  }
  validar() {
    return this.form.valid;
  }
  async next() {
    if (!this.validar()) return this.form.markAllAsTouched();
    const values = this.form.getRawValue() as Register;
    const register = await lastValueFrom(
      this.regitrar.requestByFistContact({ body: { ...(values as any) } })
      // this.authService.registrar({ body: { ...(this.form.getRawValue() as any) } })
    );
    if (values.emailAuthorization) {
      this.stage = 'checking_email';
    } else {
      this.stage = 'waiting_register';
    }
    this.userService.identificarUsuario(register);
  }
}
