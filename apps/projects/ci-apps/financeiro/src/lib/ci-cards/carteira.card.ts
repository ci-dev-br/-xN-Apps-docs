import { Component, OnInit, Optional, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { CarteiraService, CarteiraDto, TransacaoCarteiraDto } from '@ci/portal-api';

@Component({
    selector: 'ci-card--carteira',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        CurrencyPipe,
        DatePipe
    ],
    template: `
    <mat-card class="carteira-card-widget">
        <mat-card-header>
            <div mat-card-avatar class="wallet-avatar">
                <mat-icon>account_balance_wallet</mat-icon>
            </div>
            <mat-card-title>{{ carteira?.nome || 'Minha Carteira' }}</mat-card-title>
            <mat-card-subtitle>
                {{ loading ? 'Carregando...' : (possuiCarteira && carteira?.numeroCarteira ? carteira?.numeroCarteira + (carteiras.length > 1 ? ' • ' + carteiras.length + ' carteiras' : '') : 'Carteira Digital CI') }}
            </mat-card-subtitle>
            <div class="header-actions">
                <button mat-icon-button (click)="carregar()" [disabled]="loading" title="Atualizar">
                    <mat-icon>refresh</mat-icon>
                </button>
            </div>
        </mat-card-header>

        <mat-card-content>
            @if (loading) {
                <div class="loading-box">
                    <mat-spinner diameter="32"></mat-spinner>
                </div>
            } @else if (!possuiCarteira) {
                <div class="empty-wallet-onboarding">
                    <div class="onboarding-badge">
                        <mat-icon>celebration</mat-icon>
                        <span>Nova Carteira Digital</span>
                    </div>
                    <p class="onboarding-text">
                        Ative sua Carteira Digital CI gratuitamente para receber depósitos identificados via Pix e liquidar faturas com 1 clique.
                    </p>
                </div>
            } @else {
                <div class="balance-container">
                    <div class="balance-meta">
                        <span class="balance-label">
                            Posição ({{ carteira?.moeda || 'BRL' }} • {{ carteira?.tipoLastro === 'PARAMETRIZADA' ? 'Parametrizada' : 'Moeda Real' }})
                        </span>
                        <button mat-icon-button class="eye-btn" (click)="toggleSaldo()" title="Ocultar/Exibir saldo">
                            <mat-icon>{{ ocultarSaldo ? 'visibility_off' : 'visibility' }}</mat-icon>
                        </button>
                    </div>
                    <div class="balance-val">
                        @if (ocultarSaldo) {
                            ••••••••
                        } @else {
                            {{ formatarSaldoCard(carteira?.saldo || 0) }}
                        }
                    </div>
                    @if (!ocultarSaldo && (carteiras.length > 1 || carteira?.moeda !== 'BRL')) {
                        <div style="font-size: 0.76rem; opacity: 0.85; margin-top: 4px;">
                            Consolidado: {{ patrimonioTotalBrl | currency:'BRL':'symbol':'1.2-2' }}
                        </div>
                    }
                </div>

                <div class="stats-pills">
                    <div class="pill entrada">
                        <mat-icon>arrow_downward</mat-icon>
                        <span>Entradas: {{ totalEntradas | currency:'BRL':'symbol':'1.2-2' }}</span>
                    </div>
                    <div class="pill saida">
                        <mat-icon>arrow_upward</mat-icon>
                        <span>Saídas: {{ totalSaidas | currency:'BRL':'symbol':'1.2-2' }}</span>
                    </div>
                </div>

                @if (ultimasTransacoes.length > 0) {
                    <div class="mini-transacoes">
                        <span class="section-title">Últimas Movimentações</span>
                        <div class="tx-list">
                            @for (tx of ultimasTransacoes; track tx.internalId || $index) {
                                <div class="tx-item">
                                    <div class="tx-info">
                                        <span class="tx-desc">{{ tx.descricao }}</span>
                                        <span class="tx-date">{{ tx.createdAt | date:'shortDate' }}</span>
                                    </div>
                                    <span class="tx-amount" [class.entrada]="tx.tipo === 'ENTRADA'" [class.saida]="tx.tipo === 'SAIDA'">
                                        {{ tx.tipo === 'ENTRADA' ? '+' : '-' }} {{ tx.valor | currency:'BRL':'symbol':'1.2-2' }}
                                    </span>
                                </div>
                            }
                        </div>
                    </div>
                }
            }
        </mat-card-content>

        <mat-card-actions align="end">
            @if (possuiCarteira) {
                <button mat-button (click)="abrirLancamentoPosicao()">
                    <mat-icon>tune</mat-icon>
                    Lançar Posição
                </button>
            }
            <button mat-button color="primary" (click)="abrirCarteiraCompleta()">
                <mat-icon>{{ possuiCarteira ? 'open_in_new' : 'add_card' }}</mat-icon>
                {{ possuiCarteira ? 'Acessar Carteira' : 'Ativar Minha Carteira' }}
            </button>
        </mat-card-actions>
    </mat-card>
    `,
    styles: [`
        .carteira-card-widget {
            height: 100%;
            display: flex;
            flex-direction: column;
            border-radius: 14px;
            background: var(--mat-sys-surface-container, var(--mat-sys-surface, #ffffff));
            border: 1px solid var(--mat-sys-outline-variant, #e2e8f0);
            color: var(--mat-sys-on-surface, #0f172a);
        }

        .wallet-avatar {
            background: var(--mat-sys-primary-container, rgba(99, 102, 241, 0.15));
            color: var(--mat-sys-on-primary-container, #4f46e5);
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
        }

        .header-actions {
            margin-left: auto;
        }

        .loading-box {
            display: flex;
            justify-content: center;
            padding: 32px;
        }

        .balance-container {
            margin: 16px 0 12px 0;
            background: linear-gradient(135deg, var(--mat-sys-surface-container-highest, #1e1b4b) 0%, var(--mat-sys-primary-container, #312e81) 100%);
            color: var(--mat-sys-on-primary-container, #ffffff);
            border: 1px solid var(--mat-sys-outline-variant, rgba(255, 255, 255, 0.15));
            border-radius: 12px;
            padding: 16px;

            .balance-meta {
                display: flex;
                justify-content: space-between;
                align-items: center;

                .balance-label {
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--mat-sys-on-primary-container, rgba(255, 255, 255, 0.8));
                    opacity: 0.85;
                }

                .eye-btn {
                    color: var(--mat-sys-on-primary-container, rgba(255, 255, 255, 0.85));
                    width: 24px;
                    height: 24px;
                    line-height: 24px;
                    mat-icon { font-size: 18px; }
                }
            }

            .balance-val {
                font-size: 1.8rem;
                font-weight: 700;
                margin-top: 4px;
                color: var(--mat-sys-on-primary-container, #ffffff);
            }
        }

        .stats-pills {
            display: flex;
            gap: 8px;
            margin-bottom: 12px;

            .pill {
                flex: 1;
                display: flex;
                align-items: center;
                gap: 4px;
                padding: 6px 8px;
                border-radius: 8px;
                font-size: 0.75rem;
                font-weight: 500;

                mat-icon { font-size: 14px; width: 14px; height: 14px; }

                &.entrada {
                    background: rgba(34, 197, 94, 0.12);
                    color: #16a34a;
                }

                &.saida {
                    background: rgba(var(--mat-sys-error-rgb, 239, 68, 68), 0.12);
                    color: var(--mat-sys-error, #ef4444);
                }
            }
        }

        .mini-transacoes {
            .section-title {
                display: block;
                font-size: 0.75rem;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                color: var(--mat-sys-on-surface-variant, #6b7280);
                margin-bottom: 8px;
            }

            .tx-list {
                display: flex;
                flex-direction: column;
                gap: 6px;
            }

            .tx-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 0.8rem;
                padding: 6px 0;
                border-bottom: 1px solid var(--mat-sys-outline-variant, #f1f5f9);

                .tx-info {
                    display: flex;
                    flex-direction: column;
                    .tx-desc {
                        font-weight: 500;
                        color: var(--mat-sys-on-surface, #1e293b);
                    }
                    .tx-date {
                        font-size: 0.7rem;
                        color: var(--mat-sys-on-surface-variant, #9ca3af);
                    }
                }

                .tx-amount {
                    font-weight: 600;
                    &.entrada { color: #16a34a; }
                    &.saida { color: var(--mat-sys-error, #ef4444); }
                }
            }
        }

        .empty-wallet-onboarding {
            margin: 16px 0;
            padding: 16px;
            border-radius: 12px;
            background: rgba(99, 102, 241, 0.08);
            border: 1px dashed rgba(99, 102, 241, 0.35);

            .onboarding-badge {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                font-size: 0.75rem;
                font-weight: 600;
                color: var(--mat-sys-primary, #4f46e5);
                margin-bottom: 8px;

                mat-icon {
                    font-size: 16px;
                    width: 16px;
                    height: 16px;
                }
            }

            .onboarding-text {
                margin: 0;
                font-size: 0.85rem;
                line-height: 1.45;
                color: var(--mat-sys-on-surface-variant, #475569);
            }
        }
    `]
})
export class CarteiraCard implements OnInit {
    carteira?: CarteiraDto | null;
    carteiras: CarteiraDto[] = [];
    patrimonioTotalBrl = 0;
    possuiCarteira = false;
    ultimasTransacoes: TransacaoCarteiraDto[] = [];
    totalEntradas = 0;
    totalSaidas = 0;
    loading = false;
    ocultarSaldo = false;

    constructor(
        @Optional() private readonly carteiraService?: CarteiraService,
        @Optional() private readonly router?: Router,
        @Optional() private readonly cdr?: ChangeDetectorRef,
    ) { }

    ngOnInit(): void {
        this.carregar();
    }

    carregar(): void {
        if (!this.carteiraService || typeof this.carteiraService.obterMinhaCarteira !== 'function') {
            this.loading = false;
            return;
        }
        this.loading = true;
        this.carteiraService.obterMinhaCarteira().subscribe({
            next: (dto) => {
                this.loading = false;
                this.carteiras = dto?.carteiras || (dto?.carteira ? [dto.carteira] : []);
                this.patrimonioTotalBrl = Number(dto?.patrimonioTotalBrl || 0);
                if (dto && dto.carteira && dto.possuiCarteira !== false) {
                    this.possuiCarteira = true;
                    this.carteira = dto.carteira;
                } else {
                    this.possuiCarteira = false;
                    this.carteira = null;
                }
                if (dto?.transacoesRecentes) {
                    this.ultimasTransacoes = dto.transacoesRecentes.slice(0, 3);
                    this.totalEntradas = dto.transacoesRecentes
                        .filter(t => t.tipo === 'ENTRADA')
                        .reduce((sum, t) => sum + Number(t.valor || 0), 0);
                    this.totalSaidas = dto.transacoesRecentes
                        .filter(t => t.tipo === 'SAIDA')
                        .reduce((sum, t) => sum + Number(t.valor || 0), 0);
                } else {
                    this.ultimasTransacoes = [];
                    this.totalEntradas = 0;
                    this.totalSaidas = 0;
                }
                this.cdr?.markForCheck();
                this.cdr?.detectChanges();
            },
            error: () => {
                this.loading = false;
                this.cdr?.markForCheck();
                this.cdr?.detectChanges();
            }
        });
    }

    formatarSaldoCard(valor: number): string {
        const num = Number(valor || 0);
        const simbolo = this.carteira?.simboloMoeda || 'R$';
        return `${simbolo} ${num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
    }

    toggleSaldo(): void {
        this.ocultarSaldo = !this.ocultarSaldo;
    }

    abrirCarteiraCompleta(): void {
        this.router?.navigate(['/Financeiro/Carteira']);
    }

    abrirLancamentoPosicao(): void {
        this.router?.navigate(['/Financeiro/Carteira/Lancamento']);
    }
}

export const CarteiraCardInfo = {
    title: 'Minha Carteira',
    descricao: 'Saldo em conta digital, movimentações recentes e operações financeiras.',
    tags: ['Carteira', 'Saldo', 'Financeiro', 'Faturas'],
    componentRef: CarteiraCard,
    componentVersion: '1.0.0',
    componentName: 'CarteiraCard',
    settings: {}
};
