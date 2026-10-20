import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AvailableUserItem, EncryptedMessagerService } from '@ci/portal-api';

@Component({
  selector: 'ci-nova-conversa-dialog',
  standalone: false,
  template: `
    <div class="dialog-wrapper">
      <div class="dialog-header">
        <div class="header-title">
          <mat-icon color="primary">chat</mat-icon>
          <h3>Iniciar Nova Conversa</h3>
        </div>
        <button mat-icon-button (click)="fechar()" matTooltip="Fechar">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="dialog-search">
        <mat-form-field appearance="outline" class="full-width">
          <mat-icon matPrefix>search</mat-icon>
          <mat-label>Buscar usuário por nome ou login...</mat-label>
          <input matInput [(ngModel)]="termoBusca" (input)="onBuscar()" placeholder="Ex: João, Silva, dev..." />
          @if (termoBusca) {
            <button matSuffix mat-icon-button (click)="termoBusca = ''; onBuscar()">
              <mat-icon>clear</mat-icon>
            </button>
          }
        </mat-form-field>
      </div>

      <div class="dialog-content">
        @if (carregando) {
          <div class="loading-state">
            <mat-spinner diameter="32"></mat-spinner>
            <span>Buscando contatos...</span>
          </div>
        } @else if (usuarios.length === 0) {
          <div class="empty-state">
            <mat-icon>person_search</mat-icon>
            <span>Nenhum usuário encontrado</span>
          </div>
        } @else {
          <div class="users-list">
            @for (u of usuarios; track u.id) {
              <div class="user-row" (click)="selecionarUsuario(u)">
                <div class="user-avatar">
                  @if (u.photoUrl) {
                    <img [src]="u.photoUrl" alt="Foto" />
                  } @else {
                    <span>{{ getInitials(u.name || u.username) }}</span>
                  }
                </div>
                <div class="user-info">
                  <strong>{{ u.name || u.username }}</strong>
                  <small>{{ u.username }}</small>
                </div>
                <mat-icon class="arrow-icon">chevron_right</mat-icon>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .dialog-wrapper {
      padding: 20px;
      min-width: 340px;
      max-width: 500px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--mat-sys-outline-variant, rgba(128,128,128,0.2));
      padding-bottom: 8px;
    }
    .header-title {
      display: flex;
      align-items: center;
      gap: 8px;
      h3 {
        margin: 0;
        font-size: 1.15rem;
        font-weight: 600;
      }
    }
    .full-width {
      width: 100%;
    }
    .dialog-content {
      max-height: 380px;
      overflow-y: auto;
    }
    .loading-state, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 30px;
      gap: 8px;
      opacity: 0.6;
    }
    .users-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .user-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.15s ease;
      &:hover {
        background: var(--mat-sys-surface-container-high, rgba(128, 128, 128, 0.1));
      }
    }
    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--mat-sys-primary, #1976d2);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      overflow: hidden;
      flex-shrink: 0;
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    .user-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      strong {
        font-size: 0.95rem;
      }
      small {
        font-size: 0.8rem;
        opacity: 0.7;
      }
    }
    .arrow-icon {
      opacity: 0.4;
    }
  `]
})
export class NovaConversaDialogComponent implements OnInit {
  termoBusca = '';
  usuarios: AvailableUserItem[] = [];
  carregando = false;

  constructor(
    private dialogRef: MatDialogRef<NovaConversaDialogComponent>,
    private messagerService: EncryptedMessagerService
  ) {}

  ngOnInit() {
    this.carregarUsuarios();
  }

  carregarUsuarios() {
    this.carregando = true;
    this.messagerService.listarUsuarios(this.termoBusca).subscribe({
      next: (res) => {
        this.usuarios = res || [];
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
      }
    });
  }

  onBuscar() {
    this.carregarUsuarios();
  }

  selecionarUsuario(user: AvailableUserItem) {
    this.dialogRef.close(user);
  }

  fechar() {
    this.dialogRef.close();
  }

  getInitials(name?: string): string {
    if (!name) return 'U';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  }
}
