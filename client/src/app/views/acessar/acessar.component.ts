import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { AcessoPayload } from 'src/app/api/models';
import { AuthService } from 'src/app/api/services';
import { SHA512 } from 'crypto-js';
import { UserService } from 'src/app/services/user.service';
import { StorageService } from 'src/app/core/storage.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TokenService } from 'src/app/core/token.service';

@Component({
  selector: 'ci-acessar',
  templateUrl: './acessar.component.html',
  styleUrls: ['./acessar.component.scss']
})
export class AcessarComponent {
  private acesso_payload?: AcessoPayload;
  stage?: 'identification' | 'authentication' | 'authenticated';
  form?: FormGroup;
  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly storage: StorageService,
    private readonly router: Router,
    private readonly token: TokenService,
    private readonly snack: MatSnackBar
  ) {
    this.userService.user.subscribe(user => {
      if (user) this.stage = 'authenticated';
      else {
        this.acesso_payload = undefined;
        this.stage = 'identification';
        this.form = this.fb.group({
          identification: [, [Validators.required]],
        });
      }
    })
  }
  async submit() {
    try {
      if (this.form?.invalid) {
        this.snack.open('Nome inválido.');
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
            this.snack.open('Falha 1.', 'Ok');
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
                  this.snack.open('Não foi possível localizar seu cadastro.', 'Ok');
                  this.acesso_payload = undefined;
                  return;
                }
                this.acesso_payload.chaveAcesso = chave_acesso;
                this.form = this.fb.group({
                  password: [, Validators.required]
                });
                this.stage = 'authentication';
              }
            } catch (error) {
              this.snack.open('Falha 2.', 'Ok');
            }
          } else {
            this.snack.open('Falha 0.', 'Ok');
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
          this.userService.identificarUsuario(this.acesso_payload.user);
          if (this.acesso_payload.bearer) this.token.Token = this.acesso_payload.bearer;
          if (this.acesso_payload.refreshToken) this.token.RefreshToken = this.acesso_payload.refreshToken;
          this.router.navigate(['/painel']);
        } else {
          this.snack.open('Falha 3.', 'Ok');
        }
      }
    } catch (error) {
      console.error(error)
    }
  }
}
