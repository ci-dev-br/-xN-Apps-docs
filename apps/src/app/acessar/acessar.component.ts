import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { AcessoPayload, AuthService } from '@ci/portal-api';
import { SHA512 } from 'crypto-js';
import { Router, RouterModule } from '@angular/router';
import { CoreModule, StorageService } from '@ci/core';
import { AuthModule, UserService } from '@ci/auth';

@Component({
  selector: 'ci-acessar',
  standalone: true,
  imports: [
    CoreModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    RouterModule,
    AuthModule,
  ],
  templateUrl: './acessar.component.html',
  styleUrl: './acessar.component.scss'
})
export class AcessarComponent {
  private acesso_payload?: AcessoPayload;
  stage?: 'identification' | 'loading' | 'captcha' | 'authentication' = 'identification';
  form?: FormGroup;
  @ViewChild('first')
  set first(input: ElementRef<HTMLInputElement>) {
    setTimeout(() =>
      input.nativeElement.focus()
    );
  }
  constructor(
    private readonly storageService: StorageService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly snack: MatSnackBar,
    private readonly fb: FormBuilder,
    private readonly router: Router,
  ) {
    if (!!this.storageService.restore('apps.ci.dev.br.store.User')) router.navigate(['/']);
    if (this.stage) this.criarFormulario(this.stage)
  }
  private criarFormulario(stage: 'identification' | 'loading' | 'captcha' | 'authentication') {
    if (this.stage !== stage) this.stage = stage;
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
    try {
      if (this.form?.invalid) {
        this.snack.open('Identificador inválido.');
        this.form?.markAllAsTouched();
        return;
      }
      if (this.stage === 'identification') {
        if (!this.acesso_payload || !this.acesso_payload.chaveAcesso) {
          let result: AcessoPayload | null = null;
          try {
            result = await
              lastValueFrom(this.authService.acessar({
                body: {
                }
              }))
          } catch (error) {
            this.snack.open('Acesso indisponível.', 'Ok');
            console.error(error);
          }
          if (result) this.acesso_payload = result;
          if (result) {
            try {
              let chave_acesso: any = (this.acesso_payload as any).chaveAcesso;
              if (this.acesso_payload && (this.acesso_payload as any).chaveAcesso) {
                try {
                  const identificacao = this.form?.get('identification')?.value;
                  const passe = SHA512(identificacao + (this.acesso_payload as any).chaveAcesso).toString();
                  let payload = await lastValueFrom(this.authService.acessar({
                    body: {
                      chaveAcesso: SHA512((this.acesso_payload as any).chaveAcesso).toString(),
                      identificacao: passe
                    }
                  }));
                  this.acesso_payload = payload;
                } catch (error) {
                  this.snack.open('Não identificamos seu cadastro.', 'Criar conta').onAction().subscribe(() => {
                    this.router.navigate(['/registrar'])
                  });
                  console.error(error);
                  this.acesso_payload = undefined;
                  return;
                }
                this.acesso_payload.chaveAcesso = chave_acesso;
                this.criarFormulario('authentication')
              }
            } catch (error) {
              this.snack.open('Falha 2.', 'Ok');
              console.error(error);
            }
          } else {
            this.snack.open('Não foi possível solicitar acesso.', 'Ok');
          }
        }
      } else if (
        this.stage === 'authentication' &&
        this.acesso_payload?.chaveAcesso
      ) {
        this.acesso_payload = await lastValueFrom(this.authService.acessar({
          body: {
            chaveAcesso: SHA512(this.acesso_payload.chaveAcesso).toString(),
            password:
              SHA512(
                SHA512(this.form?.get('password')?.value).toString() +
                this.acesso_payload?.chaveAcesso
              ).toString()
            ,
          }
        }));
        if (this.acesso_payload?.user?.id) {
          this.storageService.store('apps.ci.dev.br.store.User', {
            authentication: {
              ...this.acesso_payload,
              user: { ...this.acesso_payload.user, photo: null }
            }
          });
          this.userService.identificarUsuario(this.acesso_payload?.user);
          setTimeout(() => this.router.navigate(['/']));
        } else {
          this.snack.open('Acesso negado!', 'Ok');
        }
      }
    } catch (error) {
      console.error(error)
    }
  }
}
