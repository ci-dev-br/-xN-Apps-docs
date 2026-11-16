import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Optional } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { combineLatest, lastValueFrom } from 'rxjs';
import { AuthService, InviteService, Register, RegisterService } from '@ci/portal-api';
import { AuthModule, UserAuthenticationService } from '@ci/auth';
import { provideNgxMask } from 'ngx-mask';
import { FooterModule } from '@ci/components';
import { ApplicationCatalogService, CoreModule, IsEmail, IsPhoneNumber, StageModule, StageService, StorageService } from '@ci/core';

@Component({
  selector: 'ci-registrar',
  imports: [
    CommonModule,
    CoreModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    RouterModule,
    AuthModule,
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
  };
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

  inviteHash?: string;
  inviteData?: {
    internalId?: string;
    email?: string;
    friendlyName?: string;
    mensagem?: string;
    inviteHash?: string;
    roles?: string[];
    accepted?: boolean;
  };
  inviteError?: string;
  isSubmittingInvite = false;
  registeredUser?: any;

  form = this.fb.group<{
    emailOrPhone: any,
    emailAuthorization: any,
    password: any,
    passwordConfirmation: any,
    confirmConsequencesOfNegationSendMail: any,
  }>({
    emailOrPhone: [, [Validators.required, Validators.email]],
    emailAuthorization: [false, [Validators.required]],
    password: [],
    passwordConfirmation: [],
    confirmConsequencesOfNegationSendMail: [false, [Validators.required]],
  });

  inviteForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    surname: [''],
    identificacao: ['', [Validators.required, Validators.minLength(3)]],
    phone: [''],
    password: ['', [Validators.required, Validators.minLength(6)]],
    passwordConfirmation: ['', [Validators.required, Validators.minLength(6)]],
    acceptTerms: [true, [Validators.requiredTrue]],
  });

  typeRegister?: 'P' | 'M';

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly inviteService: InviteService,
    private readonly userService: UserAuthenticationService,
    private readonly router: Router,
    stages: StageService,
    private readonly register: RegisterService,
    private readonly route: ActivatedRoute,
    @Optional() private readonly storageService?: StorageService,
    @Optional() private readonly catalogService?: ApplicationCatalogService,
  ) {
    stages.host = this;
  }

  validar() {
    return this.form.valid;
  }

  ngOnInit(): void {
    combineLatest([this.route.params, this.route.queryParams]).subscribe(([params, queryParams]) => {
      let hash = params?.['invite'] || queryParams?.['invite'] || queryParams?.['inviteHash'] || queryParams?.['convite'];
      if (!hash && typeof window !== 'undefined' && window.location?.search) {
        const searchParams = new URLSearchParams(window.location.search);
        hash = searchParams.get('invite') || searchParams.get('inviteHash') || searchParams.get('convite') || undefined;
      }
      if (!hash && typeof document !== 'undefined' && document.cookie) {
        const cookieMatch = document.cookie.match(/(?:^|;\s*)invite=([^;]+)/);
        if (cookieMatch?.[1]) {
          hash = decodeURIComponent(cookieMatch[1]);
        }
      }
      if (hash && String(hash).trim() !== this.inviteHash) {
        this.carregarConvite(String(hash).trim());
      }
    });

    this.inviteForm.controls.email.valueChanges.subscribe((emailVal) => {
      if (!this.inviteData?.email && typeof emailVal === 'string' && emailVal.includes('@')) {
        const suggested = emailVal.split('@')[0].replace(/[^a-zA-Z0-9._-]/g, '');
        if (suggested && !this.inviteForm.controls.identificacao.dirty) {
          this.inviteForm.controls.identificacao.setValue(suggested, { emitEvent: false });
        }
      }
    });

    this.form.controls.emailOrPhone?.valueChanges.subscribe(value => {
      this.typeRegister = typeof value === 'string' && IsEmail(value) ? 'M' : typeof value === 'string' && IsPhoneNumber(value) ? 'P' : undefined;
      if (this.typeRegister === 'M') {
        this.form.controls.emailOrPhone.setValidators([Validators.email]);
      }
      if (this.typeRegister === 'P') {
        this.form.controls.emailOrPhone.setValidators([]);
      }
      this.form.updateValueAndValidity();
    });
  }

  async carregarConvite(hash: string) {
    this.inviteHash = hash;
    this.inviteError = undefined;
    this.stage = 'loading-invite';
    try {
      const data = await lastValueFrom(
        this.inviteService.get({
          body: {
            convite: hash,
            ...( { invite: hash, inviteHash: hash } as any )
          }
        })
      );
      if (!data || (!data.email && !data.inviteHash)) {
        this.inviteError = 'O link de convite informado não foi encontrado ou expirou.';
        this.stage = 'invite-error';
        return;
      }
      this.inviteData = data as any;
      if (data.accepted) {
        this.stage = 'invite-already-accepted';
        return;
      }

      const email = (data.email || '').trim();
      const friendlyName = (data.friendlyName || '').trim();
      const suggestedUsername = email ? email.split('@')[0].replace(/[^a-zA-Z0-9._-]/g, '') : '';
      const suggestedSurname = friendlyName ? friendlyName.split(' ')[0] : suggestedUsername;

      this.inviteForm.patchValue({
        email,
        fullName: friendlyName || suggestedUsername,
        surname: suggestedSurname,
        identificacao: suggestedUsername,
        acceptTerms: true,
      });
      this.stage = 'invite-registration';
    } catch (err: any) {
      this.inviteError = err?.error?.message || 'Não foi possível validar este invite-hash.';
      this.stage = 'invite-error';
    }
  }

  get passwordsMismatch(): boolean {
    const p1 = this.inviteForm.get('password')?.value;
    const p2 = this.inviteForm.get('passwordConfirmation')?.value;
    return Boolean(p1 && p2 && p1 !== p2);
  }

  async concluirCadastroConvite() {
    if (this.inviteForm.invalid || this.passwordsMismatch || this.isSubmittingInvite) {
      this.inviteForm.markAllAsTouched();
      return;
    }

    this.isSubmittingInvite = true;
    this.inviteError = undefined;
    const val = this.inviteForm.getRawValue();

    try {
      const response: any = await lastValueFrom(
        this.authService.registrar({
          body: {
            identificacao: val.identificacao?.trim() || undefined,
            fullName: val.fullName?.trim() || undefined,
            surname: (val.surname?.trim() || val.fullName?.trim()?.split(' ')[0]) || undefined,
            email: val.email?.trim() || this.inviteData?.email,
            phone: val.phone?.trim() || undefined,
            password: val.password || undefined,
            emailAuthorization: true,
            phoneAuthorization: Boolean(val.phone),
            ...( { invite: this.inviteHash, convite: this.inviteHash } as any ),
          }
        })
      );

      this.registeredUser = response?.user || response;
      if (response?.bearer && this.registeredUser?.id) {
        this.storageService?.store('apps.ci.dev.br.store.User', {
          authentication: {
            ...response,
            user: { ...this.registeredUser, photo: null }
          }
        });
        await this.userService.identificarUsuario(this.registeredUser);
        this.catalogService?.refreshMyActivations().subscribe({ error: () => {} });
      }

      if (typeof document !== 'undefined') {
        document.cookie = 'invite=; Path=/; Max-Age=0';
      }
      this.isSubmittingInvite = false;
      this.stage = 'invite-completed';
    } catch (err: any) {
      this.isSubmittingInvite = false;
      this.inviteError = err?.error?.message || 'Não foi possível concluir o cadastro. Verifique os dados informados.';
    }
  }

  irParaLoja() {
    this.router.navigate(['/Loja']);
  }

  irParaLogin() {
    this.router.navigate(['/acessar']);
  }

  async next() {
    if (!this.validar()) return this.form.markAllAsTouched();
    const values = this.form.getRawValue() as any;
    const contact = String(values.emailOrPhone || '').trim();
    const register = await lastValueFrom(
      this.register.requestByFistContact({
        body: {
          identificacao: contact,
          email: IsEmail(contact) ? contact : undefined,
          phone: IsPhoneNumber(contact) ? contact : undefined,
          emailAuthorization: Boolean(values.emailAuthorization),
        } as any
      })
    );
    if (values.emailAuthorization) {
      this.stage = 'checking_email';
    } else {
      this.stage = 'waiting_register';
    }
    if (register) {
      this.userService.identificarUsuario(register);
    }
  }

  async continue() {
    return this.next();
  }
}

