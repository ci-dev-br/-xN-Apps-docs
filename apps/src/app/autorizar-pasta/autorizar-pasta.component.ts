import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, Optional } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthModule, UserAuthenticationService } from '@ci/auth';
import { FileExplorerService, FilePermissionItem, User } from '@ci/portal-api';
import { combineLatest, lastValueFrom, Subscription } from 'rxjs';

@Component({
  selector: 'ci-autorizar-pasta',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    AuthModule,
  ],
  template: `
    <div class="authorize-page">
      <mat-card class="authorize-card">
        <mat-card-header>
          <div mat-card-avatar class="avatar-box">
            <mat-icon>folder_shared</mat-icon>
          </div>
          <mat-card-title>Autorização de Acesso à Pasta</mat-card-title>
          <mat-card-subtitle>File Explorer Service • Validação SYSADMIN</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content class="card-body">
          @if (!token) {
            <div class="state-box error">
              <mat-icon>link_off</mat-icon>
              <p>Token de autorização não informado na URL.</p>
            </div>
          } @else if (!isAuthenticated) {
            <div class="state-box info">
              <mat-icon>lock</mat-icon>
              <h4>Autenticação SYSADMIN Necessária</h4>
              <p>Entre com sua conta <code>SYSADMIN</code> para revisar e autorizar o acesso à pasta solicitada.</p>
              <button mat-flat-button color="primary" (click)="irParaLogin()">
                <mat-icon>login</mat-icon>
                Entrar para Autorizar
              </button>
            </div>
          } @else if (!isSysAdmin) {
            <div class="state-box error">
              <mat-icon>gpp_bad</mat-icon>
              <h4>Permissão Insuficiente</h4>
              <p>O usuário autenticado não possui a role <code>SYSADMIN</code> necessária para autorizar acesso a pastas.</p>
            </div>
          } @else if (loading) {
            <div class="state-box">
              <mat-spinner diameter="36"></mat-spinner>
              <p>Carregando detalhes da solicitação...</p>
            </div>
          } @else if (errorMessage) {
            <div class="state-box error">
              <mat-icon>error_outline</mat-icon>
              <p>{{ errorMessage }}</p>
            </div>
          } @else if (requestInfo) {
            <div class="details-box">
              <div class="detail-row">
                <span class="label">Pasta Solicitada:</span>
                <code class="path-code">{{ requestInfo.path }}</code>
              </div>
              <div class="detail-row">
                <span class="label">Solicitante:</span>
                <span>{{ requestInfo.requestedByName || 'Usuário' }} ({{ requestInfo.requestedByEmail || requestInfo.requestedByUserId || '-' }})</span>
              </div>
              @if (requestInfo.reason) {
                <div class="detail-row">
                  <span class="label">Justificativa:</span>
                  <span>{{ requestInfo.reason }}</span>
                </div>
              }
              <div class="detail-row">
                <span class="label">Status Atual:</span>
                <span class="status-chip" [class.granted]="requestInfo.status === 'GRANTED'" [class.denied]="requestInfo.status === 'DENIED'">
                  {{ requestInfo.status || 'PENDING' }}
                </span>
              </div>
            </div>

            @if (actionMessage) {
              <div class="result-banner" [class.denied]="requestInfo.status === 'DENIED'">
                <mat-icon>{{ requestInfo.status === 'DENIED' ? 'block' : 'verified_user' }}</mat-icon>
                <span>{{ actionMessage }}</span>
              </div>
            }
          }
        </mat-card-content>

        <mat-card-actions align="end" class="card-actions">
          @if (isSysAdmin && requestInfo && !loading) {
            @if (requestInfo.status !== 'GRANTED') {
              <button mat-stroked-button color="warn" (click)="decidir('DENY')" [disabled]="submitting">
                <mat-icon>block</mat-icon>
                Negar
              </button>
              <button mat-flat-button color="primary" (click)="decidir('GRANT')" [disabled]="submitting">
                <mat-icon>verified_user</mat-icon>
                {{ submitting ? 'Autorizando...' : 'Autorizar Acesso à Pasta' }}
              </button>
            } @else {
              <button mat-flat-button color="primary" (click)="abrirNoArquivos()">
                <mat-icon>folder_open</mat-icon>
                Abrir no Arquivos
              </button>
            }
          }
          <a mat-button routerLink="/">Início</a>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .authorize-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    }
    .authorize-card {
      width: 100%;
      max-width: 560px;
      border-radius: 14px;
    }
    .avatar-box {
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(37, 99, 235, 0.14);
      color: #2563eb;
      border-radius: 50%;
    }
    .card-body {
      padding-top: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .state-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 10px;
      padding: 20px 12px;
      mat-icon { font-size: 40px; width: 40px; height: 40px; }
      &.error mat-icon { color: #dc2626; }
      &.info mat-icon { color: #2563eb; }
      h4, p { margin: 0; }
    }
    .details-box {
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 14px;
    }
    .detail-row {
      display: flex;
      flex-direction: column;
      gap: 4px;
      .label {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: #64748b;
        font-weight: 600;
      }
    }
    .path-code {
      display: inline-block;
      background: #0f172a;
      color: #93c5fd;
      padding: 6px 10px;
      border-radius: 6px;
      font-family: monospace;
      word-break: break-all;
    }
    .status-chip {
      display: inline-block;
      width: fit-content;
      padding: 3px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
      background: #fef3c7;
      color: #92400e;
      &.granted { background: #dcfce7; color: #166534; }
      &.denied { background: #fee2e2; color: #991b1b; }
    }
    .result-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      border-radius: 8px;
      background: #dcfce7;
      color: #166534;
      font-weight: 500;
      &.denied {
        background: #fee2e2;
        color: #991b1b;
      }
    }
    .card-actions {
      gap: 8px;
      padding: 8px 16px 16px;
    }
  `],
})
export class AutorizarPastaComponent implements OnInit, OnDestroy {
  token = '';
  isAuthenticated = false;
  isSysAdmin = false;
  loading = false;
  submitting = false;
  errorMessage?: string;
  actionMessage?: string;
  requestInfo?: FilePermissionItem;

  private subs: Subscription[] = [];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    @Optional() private readonly userAuth?: UserAuthenticationService,
    @Optional() private readonly fileExplorer?: FileExplorerService,
    @Optional() private readonly cdr?: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    const routeSub = combineLatest([this.route.params, this.route.queryParams]).subscribe(([params, query]) => {
      const nextToken = (params?.['token'] || query?.['token'] || query?.['authorizeToken'] || '').trim();
      if (nextToken !== this.token) {
        this.token = nextToken;
        if (this.isSysAdmin && this.token) {
          this.carregarSolicitacao();
        }
      }
    });
    this.subs.push(routeSub);

    if (this.userAuth?.user) {
      const userSub = this.userAuth.user.subscribe((user?: User) => {
        this.isAuthenticated = Boolean(user && user.id);
        this.isSysAdmin = Boolean(user?.roles && Array.isArray(user.roles) && user.roles.includes('SYSADMIN'));
        if (this.isSysAdmin && this.token) {
          this.carregarSolicitacao();
        } else {
          this.cdr?.markForCheck();
        }
      });
      this.subs.push(userSub);
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  async carregarSolicitacao(): Promise<void> {
    if (!this.token || !this.fileExplorer) return;
    this.loading = true;
    this.errorMessage = undefined;
    this.cdr?.markForCheck();
    try {
      this.requestInfo = await lastValueFrom(this.fileExplorer.getPermissionRequest(this.token));
    } catch (err: any) {
      this.errorMessage = err?.error?.message || err?.message || 'Não foi possível carregar a solicitação de permissão.';
    } finally {
      this.loading = false;
      this.cdr?.markForCheck();
    }
  }

  async decidir(decision: 'GRANT' | 'DENY'): Promise<void> {
    if (!this.token || !this.fileExplorer) return;
    this.submitting = true;
    this.errorMessage = undefined;
    this.cdr?.markForCheck();
    try {
      const res = await lastValueFrom(
        this.fileExplorer.authorizePermission({ token: this.token, decision })
      );
      if (this.requestInfo) {
        this.requestInfo = {
          ...this.requestInfo,
          role: decision === 'GRANT' ? 'GRANT' : 'DANY',
          status: res?.status || (decision === 'GRANT' ? 'GRANTED' : 'DENIED'),
        };
      }
      this.actionMessage = res?.message || (decision === 'GRANT'
        ? 'Acesso à pasta autorizado com sucesso!'
        : 'Solicitação negada.');
    } catch (err: any) {
      this.errorMessage = err?.error?.message || err?.message || 'Falha ao processar decisão.';
    } finally {
      this.submitting = false;
      this.cdr?.markForCheck();
    }
  }

  irParaLogin(): void {
    this.router.navigate(['/acessar'], {
      queryParams: {
        redirect: `/autorizar-pasta/${this.token}`,
      }
    });
  }

  abrirNoArquivos(): void {
    this.router.navigate(['/Arquivos'], {
      queryParams: this.requestInfo?.path ? { path: this.requestInfo.path } : undefined,
    });
  }
}
