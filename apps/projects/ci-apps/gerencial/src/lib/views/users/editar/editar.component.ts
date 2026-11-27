import { CommonModule } from '@angular/common';
import { Component, Inject, Input, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Tenant, TenantWithPermissionsDto, User, UserService } from '@ci/portal-api';
import { lastValueFrom } from 'rxjs';

export interface IDataEditar {
  data: User;
  schemaName?: string;
  availableTenants?: TenantWithPermissionsDto[];
  preselectedTenantIds?: string[];
  isMaster?: boolean;
  isAdmin?: boolean;
}

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  selector: 'ci-master-datail--editar',
  templateUrl: 'editar.component.html',
  styleUrl: 'editar.component.scss',
})
export class EditarComponent implements OnInit {
  @Input() schemaName?: string;

  form!: FormGroup;
  saving = false;
  errorMessage?: string;
  isNew = true;
  availableTenants: TenantWithPermissionsDto[] = [];
  selectableRoles: { value: string; label: string }[] = [
    { value: 'USER', label: 'Usuário (USER)' },
    { value: 'ADMIN', label: 'Administrador do Tenant (ADMIN)' },
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly userService: UserService,
    @Optional() private readonly dialogRef?: MatDialogRef<EditarComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public readonly dialogData?: IDataEditar,
  ) {
    if (this.dialogData?.schemaName) {
      this.schemaName = this.dialogData.schemaName;
    }
  }

  ngOnInit(): void {
    const user: User = this.dialogData?.data || {};
    this.isNew = !user.id;
    this.availableTenants = this.dialogData?.availableTenants || [];

    if (this.dialogData?.isMaster) {
      this.selectableRoles = [
        { value: 'USER', label: 'Usuário (USER)' },
        { value: 'ADMIN', label: 'Administrador do Tenant (ADMIN)' },
        { value: 'MASTER', label: 'Master Global (MASTER)' },
        { value: 'GOODNESS', label: 'Goodness (GOODNESS)' },
      ];
    }

    const existingRoles = Array.isArray(user.roles) && user.roles.length > 0
      ? user.roles.map(r => (r || '').toUpperCase())
      : ['USER'];

    const existingTenantIds = Array.isArray(user.tenants) && user.tenants.length > 0
      ? user.tenants.map(t => t?.id).filter((id): id is string => Boolean(id))
      : (this.isNew ? (this.dialogData?.preselectedTenantIds || []) : []);

    this.form = this.fb.group({
      fullName: [user.fullName || '', [Validators.required]],
      surname: [user.surname || ''],
      username: [user.username || '', [Validators.required]],
      email: [user.email || '', [Validators.email]],
      phone: [user.phone || ''],
      password: [''],
      roles: [existingRoles],
      tenantIds: [existingTenantIds],
    });
  }

  get showTenantWarning(): boolean {
    return !this.dialogData?.isMaster && this.availableTenants.length === 0;
  }

  async salvar(): Promise<void> {
    if (!this.form || this.form.invalid || this.saving) {
      this.form?.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errorMessage = undefined;

    try {
      const value = this.form.getRawValue();
      const rawRoles: string[] = Array.isArray(value.roles) ? value.roles : ['USER'];
      const normalizedRoles = Array.from(new Set(['USER', ...rawRoles.filter(Boolean)]));
      const selectedTenantIds: string[] = Array.isArray(value.tenantIds)
        ? value.tenantIds.filter((id: string) => Boolean(id))
        : [];

      const payload: User & { password?: string } = {
        ...(this.dialogData?.data?.id ? { id: this.dialogData.data.id } : {}),
        fullName: (value.fullName || '').trim(),
        surname: (value.surname || '').trim() || undefined,
        username: (value.username || '').trim(),
        email: (value.email || '').trim() || undefined,
        phone: (value.phone || '').trim() || undefined,
        roles: normalizedRoles,
        tenants: selectedTenantIds.map(id => ({ id } as Tenant)),
      };

      if (typeof value.password === 'string' && value.password.trim().length > 0) {
        payload.password = value.password.trim();
      }

      const saved = await lastValueFrom(this.userService.sync({ body: payload }));
      this.saving = false;
      this.dialogRef?.close(saved || payload);
    } catch (error: any) {
      this.saving = false;
      this.errorMessage =
        error?.error?.message ||
        error?.message ||
        'Não foi possível salvar os dados do usuário.';
    }
  }

  cancelar(): void {
    this.dialogRef?.close(undefined);
  }
}
