import { Component, OnInit, OnDestroy, Optional, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subscription } from 'rxjs';
import { CarteiraService, CarteiraDto, TransacaoCarteiraDto } from '@ci/portal-api';

@Component({
    selector: 'ci-financeiro-carteira',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatTabsModule,
        MatChipsModule,
        MatFormFieldModule,
        MatInputModule,
        MatDialogModule,
        MatSnackBarModule,
        MatTooltipModule,
        MatProgressSpinnerModule,
    ],
    templateUrl: './carteira.component.html',
    styleUrls: ['./carteira.component.scss']
})
export class CarteiraComponent implements OnInit, OnDestroy {
    carteira?: CarteiraDto;
    transacoes: TransacaoCarteiraDto[] = [];
    transacoesFiltradas: TransacaoCarteiraDto[] = [];

    loading = false;
    processando = false;
    mostrarSaldo = true;
    filtroTipo: 'TODOS' | 'ENTRADA' | 'SAIDA' = 'TODOS';

    // Estados para modais de ações
    modalAberto: 'DEPOSITO' | 'FATURA' | 'OPERACOES_FUTURAS' | null = null;

    // Formulário de depósito
    depositoValor: number | null = null;
    depositoIdentificador = '';
    depositoDescricao = '';

    // Formulário de pagamento de fatura
    faturaId = '';
    faturaValor: number | null = null;
    faturaDescricao = '';

    private sub?: Subscription;

    constructor(
        private carteiraService: CarteiraService,
        private snackBar: MatSnackBar,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.carregarDadosCarteira();
    }

    ngOnDestroy(): void {
        this.sub?.unsubscribe();
    }

    carregarDadosCarteira(): void {
        this.loading = true;
        this.sub = this.carteiraService.obterMinhaCarteira().subscribe({
            next: (res: any) => {
                this.carteira = res.carteira;
                this.transacoes = res.transacoesRecentes || [];
                this.aplicarFiltro(this.filtroTipo);
                this.loading = false;
                this.cdr.markForCheck();
            },
            error: (err: any) => {
                this.loading = false;
                this.snackBar.open('Erro ao carregar dados da carteira.', 'Fechar', { duration: 3500 });
                this.cdr.markForCheck();
            }
        });
    }

    aplicarFiltro(tipo: 'TODOS' | 'ENTRADA' | 'SAIDA'): void {
        this.filtroTipo = tipo;
        if (tipo === 'TODOS') {
            this.transacoesFiltradas = this.transacoes;
        } else {
            this.transacoesFiltradas = this.transacoes.filter(t => t.tipo === tipo);
        }
    }

    toggleMostrarSaldo(): void {
        this.mostrarSaldo = !this.mostrarSaldo;
    }

    copiarIdentificador(): void {
        if (!this.carteira?.numeroCarteira) return;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(this.carteira.numeroCarteira).then(() => {
                this.snackBar.open('Número da carteira copiado para a área de transferência!', 'OK', { duration: 2500 });
            });
        }
    }

    abrirModal(modal: 'DEPOSITO' | 'FATURA' | 'OPERACOES_FUTURAS'): void {
        this.modalAberto = modal;
        this.depositoValor = null;
        this.depositoIdentificador = `PIX-${Math.floor(100000 + Math.random() * 900000)}`;
        this.depositoDescricao = '';
        this.faturaId = '';
        this.faturaValor = null;
        this.faturaDescricao = '';
    }

    fecharModal(): void {
        this.modalAberto = null;
    }

    executarDeposito(): void {
        if (!this.depositoValor || this.depositoValor <= 0) {
            this.snackBar.open('Informe um valor válido maior que zero.', 'OK', { duration: 3000 });
            return;
        }

        this.processando = true;
        this.carteiraService.registrarDeposito({
            valor: this.depositoValor,
            identificador: this.depositoIdentificador,
            descricao: this.depositoDescricao || `Depósito Identificado (${this.depositoIdentificador})`
        }).subscribe({
            next: (res) => {
                this.carteira = res.carteira;
                this.transacoes.unshift(res.transacao);
                this.aplicarFiltro(this.filtroTipo);
                this.processando = false;
                this.fecharModal();
                this.snackBar.open(`Depósito de R$ ${res.transacao.valor.toFixed(2)} confirmado com sucesso!`, 'OK', { duration: 3500 });
                this.cdr.markForCheck();
            },
            error: (err) => {
                this.processando = false;
                const msg = err?.error?.message || 'Falha ao processar o depósito.';
                this.snackBar.open(msg, 'Fechar', { duration: 4000 });
                this.cdr.markForCheck();
            }
        });
    }

    executarPagamentoFatura(): void {
        if (!this.faturaId || !this.faturaId.trim()) {
            this.snackBar.open('Informe o código ou ID da fatura.', 'OK', { duration: 3000 });
            return;
        }
        if (!this.faturaValor || this.faturaValor <= 0) {
            this.snackBar.open('Informe o valor da fatura.', 'OK', { duration: 3000 });
            return;
        }

        const saldoAtual = Number(this.carteira?.saldo) || 0;
        if (saldoAtual < this.faturaValor) {
            this.snackBar.open(`Saldo insuficiente (R$ ${saldoAtual.toFixed(2)}) para pagar fatura de R$ ${this.faturaValor.toFixed(2)}.`, 'Fechar', { duration: 4000 });
            return;
        }

        this.processando = true;
        this.carteiraService.pagarFatura({
            faturaId: this.faturaId.trim(),
            valor: this.faturaValor,
            descricao: this.faturaDescricao || `Pagamento da Fatura #${this.faturaId.trim()}`
        }).subscribe({
            next: (res) => {
                this.carteira = res.carteira;
                this.transacoes.unshift(res.transacao);
                this.aplicarFiltro(this.filtroTipo);
                this.processando = false;
                this.fecharModal();
                this.snackBar.open(`Fatura #${res.transacao.referenciaFaturaId} liquidada com sucesso!`, 'OK', { duration: 3500 });
                this.cdr.markForCheck();
            },
            error: (err) => {
                this.processando = false;
                const msg = err?.error?.message || 'Falha ao liquidar a fatura.';
                this.snackBar.open(msg, 'Fechar', { duration: 4000 });
                this.cdr.markForCheck();
            }
        });
    }

    totalEntradas(): number {
        return this.transacoes
            .filter(t => t.tipo === 'ENTRADA')
            .reduce((acc, t) => acc + Number(t.valor || 0), 0);
    }

    totalSaidas(): number {
        return this.transacoes
            .filter(t => t.tipo === 'SAIDA')
            .reduce((acc, t) => acc + Number(t.valor || 0), 0);
    }
}
