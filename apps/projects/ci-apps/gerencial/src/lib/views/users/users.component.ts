import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserAuthenticationService } from '@ci/auth';
import {
  ContainerModule,
  TenantFilterBarComponent,
} from '@ci/components';
import { WindowModule, WindowService } from '@ci/components/window';
import { CoreModule } from '@ci/core';
import {
  Tenant,
  TenantService,
  TenantWithPermissionsDto,
  User,
  UserService,
} from '@ci/portal-api';
import { Subscription, lastValueFrom } from 'rxjs';
import { EditarComponent } from './editar/editar.component';

@Component({
  selector: 'ci-users-view',
  standalone: true,
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  imports: [
    CommonModule,
    CoreModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressBarModule,
    MatSnackBarModule,
    ContainerModule,
    WindowModule,
    TenantFilterBarComponent,
  ],
})
export class UsersComponent implements OnInit, OnDestroy {
  @ViewChild('linkDialog') linkDialog?: ElementRef<HTMLDialogElement>;

  stage?: 'loading' | 'ready' | 'damned' = 'loading';
  loading = false;
  savingLink = false;

  searchQuery = '';
  filtrarPapel = '';
  selectedTenantIds: string[] = [];
  availableTenants: TenantWithPermissionsDto[] = [];
  users: User[] = [];

  linkForm: { emailOrUsername: string; tenantId: string; role: 'USER' | 'ADMIN' } = {
    emailOrUsername: '',
    tenantId: '',
    role: 'USER',
  };
  linkError?: string;

  private userSub?: Subscription;
  currentRoles: string[] = [];

  constructor(
    private readonly userService: UserService,
    private readonly window: WindowService,
    @Optional() private readonly userAuth?: UserAuthenticationService,
    @Optional() private readonly tenantService?: TenantService,
    @Optional() private readonly snackBar?: MatSnackBar,
  ) {
    this.syncCurrentRoles(this.userAuth?.user?.value?.roles);
  }

  get isMaster(): boolean {
    return (
      this.currentRoles.includes('MASTER') ||
      this.currentRoles.includes('GOODNESS')
    );
  }

  get isAdmin(): boolean {
    return this.currentRoles.includes('ADMIN');
  }

  get availableRolesFilter(): string[] {
    return this.isMaster
      ? ['MASTER', 'GOODNESS', 'ADMIN', 'USER']
      : ['ADMIN', 'USER'];
  }

  get filteredUsers(): User[] {
    const query = (this.searchQuery || '').trim().toLowerCase();
    const roleFilter = (this.filtrarPapel || '').trim().toUpperCase();
    return (this.users || []).filter(u => {
      if (roleFilter) {
        const roles = (u.roles || []).map(r => (r || '').toUpperCase());
        if (!roles.includes(roleFilter)) return false;
      }
      if (query) {
        const hay = [u.fullName, u.surname, u.username, u.email, u.phone]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });
  }

  async ngOnInit(): Promise<void> {
    this.userSub = this.userAuth?.user?.subscribe(user => {
      this.syncCurrentRoles(user?.roles);
    });
    await this.loadAvailableTenantsIfNeeded();
    await this.find();
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }

  private syncCurrentRoles(roles?: string[] | null): void {
    this.currentRoles = Array.isArray(roles)
      ? roles.map(r => (r || '').trim().toUpperCase()).filter(Boolean)
      : [];
  }

  private async loadAvailableTenantsIfNeeded(): Promise<void> {
    if (this.availableTenants.length > 0 || !this.tenantService?.listarTenantsDisponiveis) {
      return;
    }
    try {
      const list = (await lastValueFrom(this.tenantService.listarTenantsDisponiveis())) || [];
      this.availableTenants = list;
      if (!this.linkForm.tenantId && list.length > 0) {
        this.linkForm.tenantId = list[0].id;
      }
    } catch {
      // Mantém lista vazia em caso de indisponibilidade
    }
  }

  onTenantsLoaded(tenants: TenantWithPermissionsDto[]): void {
    this.availableTenants = Array.isArray(tenants) ? tenants : [];
    if (!this.linkForm.tenantId && this.availableTenants.length > 0) {
      this.linkForm.tenantId = this.availableTenants[0].id;
    }
  }

  async onTenantFilterChange(tenantIds: string[]): Promise<void> {
    this.selectedTenantIds = Array.isArray(tenantIds) ? tenantIds : [];
    await this.find();
  }

  async find(): Promise<void> {
    this.loading = true;
    try {
      const list = await lastValueFrom(
        this.userService.getListByFilter({
          tenantIds:
            this.selectedTenantIds.length > 0 ? this.selectedTenantIds : undefined,
          role: this.filtrarPapel || undefined,
          search: this.searchQuery?.trim() || undefined,
        }),
      );
      this.users = Array.isArray(list) ? list : [];
      this.stage = 'ready';
    } catch (error: any) {
      this.stage = 'damned';
      this.snackBar?.open(
        error?.error?.message || 'Não foi possível carregar os usuários dos tenants disponíveis.',
        'Fechar',
        { duration: 4000 },
      );
    } finally {
      this.loading = false;
    }
  }

  canEditUser(user: User): boolean {
    if (this.isMaster) return true;
    const roles = (user?.roles || []).map(r => (r || '').toUpperCase());
    return !roles.includes('MASTER') && !roles.includes('GOODNESS');
  }

  async editar(data: User, event?: Event): Promise<any> {
    if (!this.canEditUser(data)) {
      this.snackBar?.open(
        'Administradores de tenant não possuem permissão para editar contas MASTER.',
        'Fechar',
        { duration: 3500 },
      );
      return undefined;
    }
    const result = await this.window.open(
      EditarComponent,
      {
        schemaName: 'User',
        data,
        availableTenants: this.availableTenants,
        preselectedTenantIds:
          this.selectedTenantIds.length > 0
            ? this.selectedTenantIds
            : (this.availableTenants.length === 1 ? [this.availableTenants[0].id] : []),
        isMaster: this.isMaster,
        isAdmin: this.isAdmin,
      },
      data?.id ? `Editar Usuário · ${data.fullName || data.username}` : 'Novo Usuário',
      event,
    );
    if (result) {
      await this.find();
    }
    return result;
  }

  async createNew(): Promise<void> {
    const preselected =
      this.selectedTenantIds.length > 0
        ? this.selectedTenantIds
        : (this.availableTenants.length === 1 ? [this.availableTenants[0].id] : []);
    const newInstance: User = {
      roles: ['USER'],
      tenants: preselected.map(id => ({ id } as Tenant)),
    };
    await this.editar(newInstance);
  }

  openLinkDialog(): void {
    this.linkError = undefined;
    this.linkForm = {
      emailOrUsername: '',
      tenantId:
        this.selectedTenantIds[0] ||
        this.availableTenants[0]?.id ||
        '',
      role: 'USER',
    };
    this.linkDialog?.nativeElement?.showModal();
  }

  closeLinkDialog(): void {
    this.linkDialog?.nativeElement?.close();
  }

  async confirmLinkExistingUser(): Promise<void> {
    if (this.savingLink) return;
    if (!this.linkForm.tenantId || !this.linkForm.emailOrUsername.trim()) {
      this.linkError = 'Informe o usuário (e-mail ou username) e o tenant de destino.';
      return;
    }
    this.savingLink = true;
    this.linkError = undefined;
    try {
      const roles =
        this.linkForm.role === 'ADMIN' ? ['USER', 'ADMIN'] : ['USER'];
      await lastValueFrom(
        this.userService.addToTenant({
          tenantId: this.linkForm.tenantId,
          emailOrUsername: this.linkForm.emailOrUsername.trim(),
          roles,
        }),
      );
      this.savingLink = false;
      this.closeLinkDialog();
      this.snackBar?.open('Usuário vinculado ao tenant com sucesso.', 'OK', {
        duration: 3000,
      });
      await this.find();
    } catch (error: any) {
      this.savingLink = false;
      this.linkError =
        error?.error?.message ||
        error?.message ||
        'Não foi possível vincular o usuário ao tenant.';
    }
  }

  async removeFromTenant(user: User, tenant: Tenant): Promise<void> {
    if (!user?.id || !tenant?.id) return;
    if (!this.canEditUser(user)) {
      this.snackBar?.open(
        'Não é possível desvincular contas MASTER sem privilégio MASTER.',
        'Fechar',
        { duration: 3500 },
      );
      return;
    }
    try {
      await lastValueFrom(
        this.userService.removeFromTenant({
          userId: user.id,
          tenantId: tenant.id,
        }),
      );
      this.snackBar?.open(
        `Vínculo com "${tenant.name || tenant.id}" removido.`,
        'OK',
        { duration: 2800 },
      );
      await this.find();
    } catch (error: any) {
      this.snackBar?.open(
        error?.error?.message || 'Falha ao desvincular usuário do tenant.',
        'Fechar',
        { duration: 3500 },
      );
    }
  }

  /**
   * Enviar convite para novo usuário dentro dos tenants selecionados/disponíveis.
   */
  async enviarConvite(): Promise<void> {
    const comp = await import('./enviar-convite/enviar-convite.component').then(
      m => m.EnviarConviteComponent,
    );
    await this.window.open(
      comp,
      {
        availableTenants: this.availableTenants,
        preselectedTenantIds:
          this.selectedTenantIds.length > 0
            ? this.selectedTenantIds
            : (this.availableTenants.length === 1 ? [this.availableTenants[0].id] : []),
        isMaster: this.isMaster,
      },
      'Enviar Convite',
    );
  }
}
