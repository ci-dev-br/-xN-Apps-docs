import { Component, Optional } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AcessoPayload, AuthService } from "@ci/portal-api";
import { SHA512 } from "crypto-js";
import { lastValueFrom } from "rxjs";
import { UserAuthenticationService } from "../../services/user-authentication-user.service";

/**
 * Diálogo para adicionar outra conta à sessão atual do cliente.
 * Permite conexão simultânea a múltiplas contas, combinando permissões e políticas.
 */
@Component({
    selector: 'ci-add-account-dialog',
    templateUrl: './add-account-dialog.html',
    styleUrls: ['./add-account-dialog.scss'],
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatProgressBarModule,
    ]
})
export class AddAccountDialog {
    form: FormGroup;
    loading = false;
    hidePassword = true;
    errorMessage?: string;

    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<AddAccountDialog>,
        private snackBar: MatSnackBar,
        @Optional() private authService?: AuthService,
        @Optional() private userService?: UserAuthenticationService,
    ) {
        this.form = this.fb.group({
            identification: ['', [Validators.required]],
            password: ['', [Validators.required]],
        });
    }

    async submit() {
        if (this.form.invalid || this.loading) {
            this.form.markAllAsTouched();
            return;
        }

        if (!this.authService || !this.userService) {
            this.errorMessage = 'Serviço de autenticação indisponível no momento.';
            return;
        }

        this.loading = true;
        this.errorMessage = undefined;

        try {
            const identification = this.form.get('identification')?.value?.trim();
            const password = this.form.get('password')?.value;

            // Etapa 1: Iniciar solicitação de acesso para obter chaveAcesso da sessão
            let initialPayload: AcessoPayload | null = null;
            try {
                initialPayload = await lastValueFrom(this.authService.acessar({ body: {} as any }));
            } catch (err) {
                console.error('Erro na etapa 1 de autenticação:', err);
                this.errorMessage = 'Não foi possível conectar ao servidor de autenticação.';
                return;
            }

            if (!initialPayload || !(initialPayload as any).chaveAcesso) {
                this.errorMessage = 'Falha ao iniciar credenciamento de acesso.';
                return;
            }

            const rawChaveAcesso = (initialPayload as any).chaveAcesso;

            // Etapa 2: Identificar a conta
            let identPayload: AcessoPayload | null = null;
            try {
                const passe = SHA512(identification + rawChaveAcesso).toString();
                identPayload = await lastValueFrom(this.authService.acessar({
                    body: {
                        chaveAcesso: SHA512(rawChaveAcesso).toString(),
                        identificacao: passe
                    } as any
                }));
            } catch (err) {
                console.error('Erro na etapa 2 (identificação):', err);
                this.errorMessage = 'Conta ou identificador não encontrado no sistema.';
                return;
            }

            if (!identPayload) {
                this.errorMessage = 'Não foi possível validar o identificador informado.';
                return;
            }

            // Preserva a chaveAcesso crua para o cálculo da senha
            identPayload.chaveAcesso = rawChaveAcesso;

            // Etapa 3: Autenticar senha
            let authResult: AcessoPayload | null = null;
            try {
                const passwordHashed = identPayload.mode === 'full-text'
                    ? SHA512(SHA512(password).toString() + rawChaveAcesso).toString()
                    : identPayload.mode === 'argon2'
                        ? String(password)
                        : SHA512(SHA512(password).toString() + rawChaveAcesso).toString();

                authResult = await lastValueFrom(this.authService.acessar({
                    body: {
                        chaveAcesso: SHA512(rawChaveAcesso).toString(),
                        password: passwordHashed,
                    } as any
                }));
            } catch (err) {
                console.error('Erro na etapa 3 (senha):', err);
                this.errorMessage = 'Senha incorreta. Verifique suas credenciais.';
                return;
            }

            if (!authResult || !authResult.user || !authResult.user.id) {
                this.errorMessage = 'Falha ao autenticar: credenciais inválidas ou acesso recusado.';
                return;
            }

            // Adiciona a nova conta na lista de contas conectadas
            const account = await this.userService.adicionarConta(authResult, authResult.user, false);

            const displayName = account.user.surname || account.user.fullName || account.user.username || 'Conta';
            this.snackBar.open(
                `Conta "${displayName}" conectada com sucesso! Permissões combinadas.`,
                'Fechar',
                { duration: 4000 }
            );

            this.dialogRef.close(account);
        } catch (error: any) {
            console.error('Erro geral ao conectar outra conta:', error);
            this.errorMessage = error?.message || 'Ocorreu um erro ao conectar a conta. Tente novamente.';
        } finally {
            this.loading = false;
        }
    }
}
