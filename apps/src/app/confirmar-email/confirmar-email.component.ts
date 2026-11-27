import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, Optional, PLATFORM_ID } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthModule, UserAuthenticationService } from '@ci/auth';
import { AuthService, ConfirmarEmailOutputDto, User } from '@ci/portal-api';
import { combineLatest, lastValueFrom, Subscription } from 'rxjs';

@Component({
  selector: 'ci-confirmar-email',
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
    <div class="confirm-page">
      <mat-card class="confirm-card">
        <mat-card-header>
          <div mat-card-avatar class="avatar-box" [class.verified]="result?.verified" [class.error]="!!errorMessage">
            <mat-icon>{{ result?.verified ? 'mark_email_read' : (errorMessage ? 'error_outline' : 'mark_email_unread') }}</mat-icon>
          </div>
          <mat-card-title>Confirmação de E-mail</mat-card-title>
          <mat-card-subtitle>Validação de endereço de e-mail • Apps ci.dev.br</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content class="card-body">
          @if (!token) {
            <div class="state-box error">
              <mat-icon>link_off</mat-icon>
              <h4>Link Incompleto</h4>
              <p>O token de confirmação de e-mail não foi informado na URL.</p>
            </div>
          } @else if (loading) {
            <div class="state-box info">
              <mat-spinner diameter="38"></mat-spinner>
              <h4>Confirmando seu e-mail...</h4>
              <p>Aguarde enquanto validamos seu token de verificação.</p>
            </div>
          } @else if (errorMessage) {
            <div class="state-box error">
              <mat-icon>gpp_bad</mat-icon>
              <h4>Não foi possível confirmar o e-mail</h4>
              <p>{{ errorMessage }}</p>
            </div>
          } @else if (result?.verified) {
            <div class="state-box success">
              <mat-icon>verified</mat-icon>
              <h4>{{ result?.alreadyVerified ? 'E-mail já verificado' : 'E-mail confirmado com sucesso!' }}</h4>
              <p>{{ result?.message }}</p>
              @if (result?.email) {
                <div class="email-pill">
                  <mat-icon>email</mat-icon>
                  <span>{{ result?.email }}</span>
                </div>
              }
            </div>
          }
        </mat-card-content>

        <mat-card-actions align="end" class="card-actions">
          @if (isAuthenticated) {
            <a mat-flat-button color="primary" routerLink="/Profile">
              <mat-icon>person</mat-icon>
              Ir para Meu Perfil
            </a>
          } @else {
            <a mat-flat-button color="primary" routerLink="/acessar">
              <mat-icon>login</mat-icon>
              Acessar Plataforma
            </a>
          }
          <a mat-button routerLink="/">Início</a>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .confirm-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      box-sizing: border-box;
    }
    .confirm-card {
      width: 100%;
      max-width: 520px;
      border-radius: 16px;
    }
    .avatar-box {
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(37, 99, 235, 0.14);
      color: #2563eb;
      border-radius: 50%;

      &.verified {
        background: #dcfce7;
        color: #16a34a;
      }

      &.error {
        background: #fee2e2;
        color: #dc2626;
      }
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
      gap: 12px;
      padding: 20px 12px;

      mat-icon {
        font-size: 44px;
        width: 44px;
        height: 44px;
      }

      &.info mat-icon { color: #2563eb; }
      &.success mat-icon { color: #16a34a; }
      &.error mat-icon { color: #dc2626; }

      h4 {
        margin: 0;
        font-size: 19px;
        font-weight: 700;
        color: #0f172a;
      }

      p {
        margin: 0;
        font-size: 14px;
        line-height: 1.5;
        color: #475569;
      }
    }
    .email-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 999px;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      font-size: 13px;
      font-weight: 600;
      color: #0f172a;
      word-break: break-all;

      mat-icon {
        font-size: 16px !important;
        width: 16px !important;
        height: 16px !important;
        color: #2563eb !important;
      }
    }
    .card-actions {
      gap: 8px;
      padding: 8px 16px 16px;
    }
  `],
})
export class ConfirmarEmailComponent implements OnInit, OnDestroy {
  token = '';
  loading = false;
  isAuthenticated = false;
  currentUser?: User;
  result?: ConfirmarEmailOutputDto;
  errorMessage?: string;

  private subs: Subscription[] = [];
  private confirmedToken?: string;

  constructor(
    @Inject(PLATFORM_ID) private readonly platformId: object,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    @Optional() private readonly authService?: AuthService,
    @Optional() private readonly userAuth?: UserAuthenticationService,
    @Optional() private readonly cdr?: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    if (this.userAuth?.user) {
      const userSub = this.userAuth.user.subscribe((user?: User) => {
        this.currentUser = user;
        this.isAuthenticated = Boolean(user && user.id);
        this.cdr?.markForCheck();
      });
      this.subs.push(userSub);
    }

    const routeSub = combineLatest([this.route.params, this.route.queryParams]).subscribe(([params, query]) => {
      const nextToken = (params?.['token'] || query?.['token'] || '').trim();
      if (nextToken && nextToken !== this.confirmedToken) {
        this.token = nextToken;
        if (isPlatformBrowser(this.platformId)) {
          this.confirmar(nextToken);
        }
      } else if (!nextToken) {
        this.token = '';
        this.cdr?.markForCheck();
      }
    });
    this.subs.push(routeSub);
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  async confirmar(token: string): Promise<void> {
    if (!this.authService) {
      this.errorMessage = 'Serviço de autenticação indisponível.';
      return;
    }

    this.confirmedToken = token;
    this.loading = true;
    this.errorMessage = undefined;
    this.result = undefined;
    this.cdr?.markForCheck();

    try {
      const res = await lastValueFrom(this.authService.confirmarEmail({ body: { token } }));
      this.result = res;

      if (res?.verified && this.userAuth) {
        const userToUpdate = this.currentUser || this.userAuth.user.value;
        if (userToUpdate?.id && (!res.userId || userToUpdate.id === res.userId)) {
          this.userAuth.atualizarPerfilConta({
            ...userToUpdate,
            email: res.email || userToUpdate.email,
            emailVerificado: true,
          });
        }
      }
    } catch (err: any) {
      this.errorMessage =
        err?.error?.message ||
        err?.message ||
        'Token inválido ou expirado. Solicite um novo link de confirmação em /Profile.';
    } finally {
      this.loading = false;
      this.cdr?.markForCheck();
    }
  }
}
