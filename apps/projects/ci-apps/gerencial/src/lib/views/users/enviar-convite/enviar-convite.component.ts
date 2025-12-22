import { Component } from "@angular/core";
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogRef } from "@angular/material/dialog";
import { MatFormField, MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { UserService } from "@ci/portal-api";
import { lastValueFrom } from "rxjs";

/**
 *  Componente para enviar convite a novos usuários
 * 
 * Descrição:
 * Este componente fornece uma interface para enviar convites a novos usuários
 * para se registrarem na plataforma. Ele inclui um formulário simples onde o
 * administrador pode inserir o e-mail do usuário a ser convidado e enviar o convite.
 * 
 *  Funcionalidades:
 * - Formulário para inserir o e-mail do novo usuário.
 * - Botão para enviar o convite.
 * Validação básica do e-mail.
 * Design responsivo utilizando Angular Material.
 * Uso:
 * ```
 * <ci-enviar-convite></ci-enviar-convite>
 * ```
 * 
 * Notas:
 * Este componente é parte do módulo de gerenciamento de usuários e depende dos
 * módulos Angular Material para estilização e funcionalidade.
 * 
 *  
 **/
@Component({
    selector: 'ci-enviar-convite',
    standalone: true,
    imports: [
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        FormsModule,
        ReactiveFormsModule,
    ],
    templateUrl: './enviar-convite.component.html',
    styleUrls: ['./enviar-convite.component.scss'],
})
export class EnviarConviteComponent {
    protected form = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        mensagem: [''],
        friendlyName: [''],
    });
    constructor(
        private readonly fb: FormBuilder,
        private readonly users: UserService,
        private dialogRef: MatDialogRef<EnviarConviteComponent>
    ) { }
    /**
     *  Envia o convite para o e-mail especificado no formulário.
     */
    async enviarConvite() {
        if (this.form.valid) {
            try {
                await lastValueFrom(this.users.sendInvitation({
                    body: {
                        email: this.form.value.email!,
                        mensagem: this.form.value.mensagem!,
                        friendlyName: this.form.value.friendlyName!,
                    }
                }));
                this.form.reset();
                this.dialogRef.close(true);
            } catch (error) {
                this.form.setErrors({ envioFalhou: true });
                this.form.markAllAsTouched();
            }
        } else {
            this.form.markAllAsTouched();
        }
    }
}