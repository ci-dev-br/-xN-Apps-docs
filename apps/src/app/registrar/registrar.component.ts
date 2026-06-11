import { Component, EventEmitter, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { AuthService, Register, RegisterService } from '@ci/portal-api';
import { AuthModule, UserAuthenticationService } from '@ci/auth';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { FooterModule } from '@ci/components';
import { CoreModule, IsEmail, IsPhoneNumber, StageModule, StageService } from '@ci/core';

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
    // NgxMaskDirective,
    FooterModule,
    StageModule,
  ],
  providers: [provideNgxMask()],
  standalone: true,
  templateUrl: './registrar.component.html',
  styleUrl: './registrar.component.scss'
})
export class RegistrarComponent implements OnInit {
  termos = {
    "M": 'e-mail',
    "P": 'sms'
  }
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
  protected emailOrPhoneMask?: string;
  form = this.fb.group<{
    // coak: any,
    emailOrPhone: any,
    emailAuthorization: any,
    password: any,
    passwordConfirmation: [],
    confirmConsequencesOfNegationSendMail: any,
  }>({
    // coak: [false, Validators.required],
    emailOrPhone: [, [Validators.required, Validators.email]],
    emailAuthorization: [false, [Validators.required]],
    password: [],
    passwordConfirmation: [],
    confirmConsequencesOfNegationSendMail: [false, [Validators.required]],
  });
  typeRegister?: 'P' | 'M';
  constructor(
    private readonly fb: FormBuilder,
    // private readonly authService: AuthService,
    private readonly userService: UserAuthenticationService,
    // private readonly router: Router,
    /* // private readonly */ stages: StageService,
    private readonly regitrar: RegisterService,
    private readonly route: ActivatedRoute,
  ) {
    stages.host = this;
    route.params.subscribe((params: any) => {
      if (params.invite) {

      }
    })
  }
  validar() {
    return this.form.valid;
  }
  ngOnInit(): void {
    this.form.controls.emailOrPhone?.valueChanges.subscribe(value => {
      this.typeRegister = typeof value === 'string' && IsEmail(value) ? 'M' : typeof value === 'string' && IsPhoneNumber(value) ? 'P' : undefined;
      if (this.typeRegister === 'M') {
        this.form.controls.emailOrPhone.setValidators([Validators.email]);
      }
      if (this.typeRegister === 'P') {
        this.form.controls.emailOrPhone.setValidators([]);
      }
      this.form.updateValueAndValidity();
    })
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

