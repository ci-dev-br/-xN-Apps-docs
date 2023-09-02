import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { AcessoPayload } from 'src/app/api/models';
import { AuthService } from 'src/app/api/services';
import { SHA512 } from 'crypto-js';
import { UserService } from 'src/app/services/user.service';
import { StorageService } from 'src/app/core/storage.service';

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
    if (this.form?.invalid) return this.form?.markAllAsTouched();
    if (this.stage === 'identification') {
      if (!this.acesso_payload || !this.acesso_payload.chaveAcesso) {
        this.acesso_payload = await lastValueFrom(this.authService.acessar({
          body: {
          }
        }));
        let chave_acesso = this.acesso_payload.chaveAcesso;
        if (this.acesso_payload.chaveAcesso) {
          const identificacao = this.form?.get('identification')?.value;
          const passe = SHA512(identificacao + this.acesso_payload.chaveAcesso).toString();
          this.acesso_payload = await lastValueFrom(this.authService.acessar({
            body: {
              chaveAcesso: SHA512(this.acesso_payload.chaveAcesso).toString(),
              identificacao: passe
            }
          }));
          this.acesso_payload.chaveAcesso = chave_acesso;
          this.form = this.fb.group({
            password: [, Validators.required]
          });
          this.stage = 'authentication';
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
      if (this.acesso_payload.user?.id) {
        this.userService.identificarUsuario(this.acesso_payload.user);
        if (this.acesso_payload.bearer) this.storage.set('__access_token', { a: this.acesso_payload.bearer })
      }
    }
  }
}
