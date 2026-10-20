import { Component, OnInit, Optional } from '@angular/core';
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
            <mat-card-title>Minha Carteira</mat-card-title>
            <mat-card-subtitle>{{ carteira?.numeroCarteira || 'Carregando...' }}</mat-card-subtitle>
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
            } @else {
                <div class="balance-container">
                    <div class="balance-meta">
                        <span class="balance-label">Saldo Disponível</span>
                        <button mat-icon-button class="eye-btn" (click)="toggleSaldo()" title="Ocultar/Exibir saldo">
                            <mat-icon>{{ ocultarSaldo ? 'visibility_off' : 'visibility' }}</mat-icon>
                        </button>
                    </div>
                    <div class="balance-val">
                        @if (ocultarSaldo) {
                            ••••••••
                        } @else {
                            {{ (carteira?.saldo || 0) | currency:'BRL':'symbol':'1.2-2' }}
                        }
                    </div>
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
            <button mat-button color="primary" (click)="abrirCarteiraCompleta()">
                <mat-icon>open_in_new</mat-icon> Acessar Carteira
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
        }

        .wallet-avatar {
            background: rgba(99, 102, 241, 0.15);
            color: #4f46e5;
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
            background: linear-gradient(135deg, #1e1e38 0%, #2b2b52 100%);
            color: white;
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
                    opacity: 0.8;
                }

                .eye-btn {
                    color: white;
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
                    background: rgba(34, 197, 94, 0.1);
                    color: #16a34a;
                }

                &.saida {
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
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
                color: #6b7280;
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
                padding: 4px 0;
                border-bottom: 1px solid rgba(0, 0, 0, 0.04);

                .tx-info {
                    display: flex;
                    flex-direction: column;
                    .tx-desc { font-weight: 500; }
                    .tx-date { font-size: 0.7rem; color: #9ca3af; }
                }

                .tx-amount {
                    font-weight: 600;
                    &.entrada { color: #16a34a; }
                    &.saida { color: #ef4444; }
                }
            }
        }
    `]
})
export class CarteiraCard implements OnInit {
    carteira?: CarteiraDto;
    ultimasTransacoes: TransacaoCarteiraDto[] = [];
    totalEntradas = 0;
    totalSaidas = 0;
    loading = false;
    ocultarSaldo = false;

    constructor(
        @Optional() private readonly carteiraService?: CarteiraService,
        @Optional() private readonly router?: Router,
    ) { }

    ngOnInit(): void {
        this.carregar();
    }

    carregar(): void {
        if (!this.carteiraService) return;
        this.loading = true;
        this.carteiraService.obterMinhaCarteira().subscribe({
            next: (dto) => {
                this.carteira = dto?.carteira;
                if (dto?.transacoesRecentes) {
                    this.ultimasTransacoes = dto.transacoesRecentes.slice(0, 3);
                    this.totalEntradas = dto.transacoesRecentes
                        .filter(t => t.tipo === 'ENTRADA')
                        .reduce((sum, t) => sum + Number(t.valor || 0), 0);
                    this.totalSaidas = dto.transacoesRecentes
                        .filter(t => t.tipo === 'SAIDA')
                        .reduce((sum, t) => sum + Number(t.valor || 0), 0);
                }
                this.loading = false;
            },
            error: () => {
                this.loading = false;
            }
        });
    }

    toggleSaldo(): void {
        this.ocultarSaldo = !this.ocultarSaldo;
    }

    abrirCarteiraCompleta(): void {
        this.router?.navigate(['/Financeiro/Carteira']);
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
