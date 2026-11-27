import { CommonModule } from '@angular/common';
import { Component, Inject, Optional } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { InviteService, TenantWithPermissionsDto } from '@ci/portal-api';
import { lastValueFrom } from 'rxjs';

export interface IEnviarConviteDialogData {
  availableTenants?: TenantWithPermissionsDto[];
  preselectedTenantIds?: string[];
  isMaster?: boolean;
}

@Component({
  selector: 'ci-enviar-convite',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './enviar-convite.component.html',
  styleUrls: ['./enviar-convite.component.scss'],
})
export class EnviarConviteComponent {
  protected availableTenants: TenantWithPermissionsDto[] = [];
  protected roleOptions: { value: string; label: string }[] = [
    { value: 'USER', label: 'Usuário (USER)' },
    { value: 'ADMIN', label: 'Administrador do Tenant (ADMIN)' },
  ];

  protected form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    mensagem: [''],
    friendlyName: [''],
    roles: [['USER']],
    tenantIds: [[] as string[]],
  });

  protected isSending = false;
  protected errorMessage?: string;
  protected inviteResult?: {
    inviteHash?: string;
    registrationLink?: string;
    email?: string;
    friendlyName?: string;
    tenantIds?: string[];
  };
  protected copied = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly invites: InviteService,
    private readonly dialogRef: MatDialogRef<EnviarConviteComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public readonly dialogData?: IEnviarConviteDialogData,
  ) {
    this.availableTenants = dialogData?.availableTenants || [];
    if (dialogData?.isMaster) {
      this.roleOptions = [
        { value: 'USER', label: 'Usuário (USER)' },
        { value: 'ADMIN', label: 'Administrador do Tenant (ADMIN)' },
        { value: 'MASTER', label: 'Master Global (MASTER)' },
      ];
    }

    const defaultTenants = Array.isArray(dialogData?.preselectedTenantIds) && dialogData.preselectedTenantIds.length > 0
      ? dialogData.preselectedTenantIds
      : (this.availableTenants.length === 1 ? [this.availableTenants[0].id] : []);

    this.form.patchValue({
      tenantIds: defaultTenants,
    });
  }

  /**
   * Envia o convite para o e-mail especificado no formulário, vinculando aos tenants escolhidos.
   */
  async enviarConvite() {
    if (this.form.valid && !this.isSending) {
      this.isSending = true;
      this.errorMessage = undefined;
      try {
        const tenantIds = (this.form.value.tenantIds || []).filter(Boolean);
        const rawRoles = (this.form.value.roles || ['USER']).filter(Boolean);
        const roles = Array.from(new Set(['USER', ...rawRoles]));

        const res: any = await lastValueFrom(
          this.invites.sendTenantInvitation({
            email: this.form.value.email!,
            mensagem: this.form.value.mensagem || undefined,
            friendlyName: this.form.value.friendlyName || undefined,
            roles,
            tenantIds: tenantIds.length > 0 ? tenantIds : undefined,
          }),
        );
        const hash = (res?.inviteHash || res?.convite) as any;
        const origin = typeof window !== 'undefined' ? window.location.origin : 'https://apps.ci.dev.br';
        this.inviteResult = {
          inviteHash: hash,
          registrationLink: (res?.registrationLink || (hash ? `${origin}/registrar/${hash}` : undefined) as any),
          email: res?.email || this.form.value.email!,
          friendlyName: res?.friendlyName || this.form.value.friendlyName!,
          tenantIds: res?.tenantIds || tenantIds,
        };
        this.isSending = false;
      } catch (error: any) {
        this.isSending = false;
        this.errorMessage = error?.error?.message || error?.message || 'Não foi possível enviar o convite.';
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
