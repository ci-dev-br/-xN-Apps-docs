import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  effect,
  EventEmitter,
  Input,
  OnInit,
  Optional,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TenantService, TenantWithPermissionsDto } from '@ci/portal-api';
import { lastValueFrom } from 'rxjs';
import { NavbarService } from '../navbar/navbar.service';

@Component({
  selector: 'ci-tenant-filter-bar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  template: `
    <div class="ci-tenant-filter-bar" [class.compact]="compact">
      <div class="tenant-filter-label">
        <mat-icon>workspaces</mat-icon>
        <span>{{ label }}</span>
      </div>

      @if (multiple) {
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="tenant-select-field">
          <mat-label>Segmentar por Tenants</mat-label>
          <mat-select
            multiple
            [ngModel]="selectedTenantIds"
            (ngModelChange)="onMultiSelectionChange($event)"
            [disabled]="loading"
            placeholder="Todos os Tenants">
            @for (tenant of availableTenants; track tenant.id) {
              <mat-option [value]="tenant.id">
                <span>{{ tenant.name || tenant.id }}</span>
                @if (tenant.permissionsSummary; as perms) {
                  <small class="tenant-perm-hint">
                    ({{ perms.canEditar ? 'Editar' : (perms.canVer ? 'Ver' : 'Visualizar') }}{{ perms.canCompartilhar ? ' · Compartilhar' : '' }})
                  </small>
                }
              </mat-option>
            }
          </mat-select>
        </mat-form-field>
      } @else {
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="tenant-select-field">
          <mat-label>Tenant</mat-label>
          <mat-select
            [ngModel]="selectedTenantIds[0] || ''"
            (ngModelChange)="onSingleSelectionChange($event)"
            [disabled]="loading">
            <mat-option value="">Todos os Tenants</mat-option>
            @for (tenant of availableTenants; track tenant.id) {
              <mat-option [value]="tenant.id">
                {{ tenant.name || tenant.id }}
              </mat-option>
            }
          </mat-select>
        </mat-form-field>
      }

      @if (selectedTenants.length > 0) {
        <div class="tenant-active-pills" aria-label="Tenants selecionados">
          @for (t of selectedTenants; track t.id) {
            <span class="tenant-pill">
              <span>{{ t.name || t.id }}</span>
              <button
                type="button"
                class="pill-remove-btn"
                (click)="removeTenant(t.id)"
                [attr.aria-label]="'Remover filtro do tenant ' + (t.name || t.id)"
                matTooltip="Remover tenant">
                <mat-icon>close</mat-icon>
              </button>
            </span>
          }
          <button
            mat-button
            type="button"
            class="clear-tenants-btn"
            (click)="clearSelection()"
            matTooltip="Limpar segmentação de tenants">
            Todos
          </button>
        </div>
      } @else if (!loading && availableTenants.length === 0) {
        <span class="tenant-empty-hint">Visão global (todos os registros acessíveis)</span>
      }

      <button
        mat-icon-button
        type="button"
        class="refresh-tenants-btn"
        (click)="loadTenants()"
        [disabled]="loading"
        matTooltip="Atualizar lista de tenants disponíveis"
        aria-label="Atualizar lista de tenants">
        <mat-icon [class.spin]="loading">sync</mat-icon>
      </button>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .ci-tenant-filter-bar {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
      padding: 10px 14px;
      border-radius: 12px;
      background: var(--mat-sys-surface-container-low, #f1f5f9);
      border: 1px solid var(--mat-sys-outline-variant, rgba(0, 0, 0, 0.08));
    }

    .ci-tenant-filter-bar.compact {
      padding: 6px 10px;
      border-radius: 10px;
      gap: 8px;
    }

    .tenant-filter-label {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 600;
      color: var(--mat-sys-on-surface-variant, #475569);

      mat-icon {
        font-size: 18px;
        inline-size: 18px;
        block-size: 18px;
        color: var(--mat-sys-primary, #4f46e5);
      }
    }

    .tenant-select-field {
      min-inline-size: 220px;
      max-inline-size: 320px;
      flex: 0 1 260px;
    }

    .tenant-perm-hint {
      opacity: 0.72;
      margin-inline-start: 4px;
    }

    .tenant-active-pills {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 6px;
      min-inline-size: 0;
    }

    .tenant-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 8px 3px 10px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      background: var(--mat-sys-primary-container, #e0e7ff);
      color: var(--mat-sys-on-primary-container, #3730a3);
    }

    .pill-remove-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: transparent;
      color: inherit;
      cursor: pointer;
      padding: 0;
      border-radius: 50%;

      mat-icon {
        font-size: 14px;
        inline-size: 14px;
        block-size: 14px;
      }
    }

    .clear-tenants-btn {
      font-size: 12px;
      min-inline-size: auto;
      padding: 0 8px;
    }

    .tenant-empty-hint {
      font-size: 12px;
      color: var(--mat-sys-on-surface-variant, #64748b);
    }

    .refresh-tenants-btn {
      margin-inline-start: auto;
    }

    .spin {
      animation: ci-spin 1s linear infinite;
    }

    @keyframes ci-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `],
})
export class TenantFilterBarComponent implements OnInit {
  @Input() selectedTenantIds: string[] = [];
  @Output() selectedTenantIdsChange = new EventEmitter<string[]>();
  @Output() availableTenantsChange = new EventEmitter<TenantWithPermissionsDto[]>();

  @Input() label = 'Tenants:';
  @Input() multiple = true;
  @Input() compact = false;

  availableTenants: TenantWithPermissionsDto[] = [];
  loading = false;
  private lastOrgId?: string;

  constructor(
    @Optional() private readonly tenantService?: TenantService,
    @Optional() private readonly navbarService?: NavbarService,
    @Optional() private readonly cdr?: ChangeDetectorRef,
  ) {
    if (this.navbarService?.organizationAccess) {
      effect(() => {
        const orgId = this.navbarService?.organizationAccess()?.organizationId;
        if (orgId !== this.lastOrgId) {
          this.loadTenants(orgId);
        }
      });
    }
  }

  ngOnInit(): void {
    const orgId = this.navbarService?.organizationAccess?.()?.organizationId;
    this.loadTenants(orgId);
  }

  get selectedTenants(): TenantWithPermissionsDto[] {
    const selected = new Set(this.selectedTenantIds || []);
    return (this.availableTenants || []).filter(t => selected.has(t.id));
  }

  async loadTenants(orgId?: string): Promise<void> {
    if (!this.tenantService || typeof this.tenantService.listarTenantsDisponiveis !== 'function') {
      return;
    }
    this.lastOrgId = orgId;
    this.loading = true;
    this.cdr?.markForCheck();
    try {
      const list = (await lastValueFrom(this.tenantService.listarTenantsDisponiveis(orgId))) || [];
      this.availableTenants = list.filter(
        t => t.permissionsSummary?.canVisualizar !== false || t.permissionsSummary?.canVer !== false,
      );
      this.availableTenantsChange.emit(this.availableTenants);
      if (this.selectedTenantIds.length > 0) {
        const validIds = new Set(this.availableTenants.map(t => t.id));
        const filtered = this.selectedTenantIds.filter(id => validIds.has(id));
        if (filtered.length !== this.selectedTenantIds.length) {
          this.emitChange(filtered);
        }
      }
    } catch {
      // Mantém lista atual caso o endpoint esteja indisponível
    } finally {
      this.loading = false;
      this.cdr?.markForCheck();
    }
  }

  onMultiSelectionChange(ids: string[]): void {
    this.emitChange(Array.isArray(ids) ? ids.filter(Boolean) : []);
  }

  onSingleSelectionChange(id: string): void {
    this.emitChange(id ? [id] : []);
  }

  removeTenant(id: string): void {
    this.emitChange((this.selectedTenantIds || []).filter(t => t !== id));
  }

  clearSelection(): void {
    this.emitChange([]);
  }

  private emitChange(next: string[]): void {
    this.selectedTenantIds = next;
    this.selectedTenantIdsChange.emit(next);
  }
}
