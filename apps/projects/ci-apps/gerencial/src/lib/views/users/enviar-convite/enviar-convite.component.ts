import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogRef } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { InviteService } from "@ci/portal-api";
import { lastValueFrom } from "rxjs";

@Component({
    selector: 'ci-enviar-convite',
    standalone: true,
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
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
    protected isSending = false;
    protected inviteResult?: {
        inviteHash?: string;
        registrationLink?: string;
        email?: string;
        friendlyName?: string;
    };
    protected copied = false;

    constructor(
        private readonly fb: FormBuilder,
        private readonly invites: InviteService,
        private dialogRef: MatDialogRef<EnviarConviteComponent>
    ) { }

    /**
     * Envia o convite para o e-mail especificado no formulário e gera o invite-hash.
     */
    async enviarConvite() {
        if (this.form.valid && !this.isSending) {
            this.isSending = true;
            try {
                const res: any = await lastValueFrom(this.invites.sendInvitation({
                    body: {
                        email: this.form.value.email!,
                        mensagem: this.form.value.mensagem!,
                        friendlyName: this.form.value.friendlyName!,
                    }
                }));
                const hash = (res?.inviteHash || res?.convite) as any;
                const origin = typeof window !== 'undefined' ? window.location.origin : 'https://apps.ci.dev.br';
                this.inviteResult = {
                    inviteHash: hash,
                    registrationLink: (res?.registrationLink || (hash ? `${origin}/registrar/${hash}` : undefined) as any),
                    email: res?.email || this.form.value.email!,
                    friendlyName: res?.friendlyName || this.form.value.friendlyName!,
                };
                this.isSending = false;
            } catch (error) {
                this.isSending = false;
                this.form.setErrors({ envioFalhou: true });
                this.form.markAllAsTouched();
            }
        } else {
            this.form.markAllAsTouched();
        }
    }

    copiarLink() {
        if (!this.inviteResult?.registrationLink) return;
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(this.inviteResult.registrationLink);
            this.copied = true;
            setTimeout(() => (this.copied = false), 2500);
        }
    }

    fechar() {
        this.dialogRef.close(this.inviteResult || true);
    }
}