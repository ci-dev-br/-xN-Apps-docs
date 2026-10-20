import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';

export interface CarteiraDto {
    internalId?: string;
    userId?: string;
    numeroCarteira?: string;
    saldo: number;
    moeda: string;
    status: 'ATIVA' | 'BLOQUEADA' | 'SUSPENSA';
    limiteDiario?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface TransacaoCarteiraDto {
    internalId?: string;
    carteiraId?: string;
    tipo: 'ENTRADA' | 'SAIDA';
    categoria: 'DEPOSITO' | 'PAGAMENTO_FATURA' | 'TRANSFERENCIA' | 'ESTORNO' | 'OUTROS';
    valor: number;
    saldoAnterior?: number;
    saldoPosterior?: number;
    descricao?: string;
    identificador?: string;
    referenciaFaturaId?: string;
    status: 'CONCLUIDA' | 'PENDENTE' | 'CANCELADA';
    createdAt?: string;
    metadados?: any;
}

export interface VisaoGeralCarteiraDto {
    carteira: CarteiraDto;
    transacoesRecentes: TransacaoCarteiraDto[];
}

@Injectable({
    providedIn: 'root'
})
export class CarteiraService extends BaseService {
    constructor(
        config: ApiConfiguration,
        http: HttpClient
    ) {
        super(config, http);
    }

    /**
     * Retorna a visão geral da carteira do usuário atual (saldo, número para depósitos e movimentações recentes)
     */
    obterMinhaCarteira(): Observable<VisaoGeralCarteiraDto> {
        return this.http.get<VisaoGeralCarteiraDto>(`${this.rootUrl}/Financeiro/Carteira/Minha`);
    }

    /**
     * Registra um depósito identificado na carteira
     */
    registrarDeposito(dados: {
        valor: number;
        identificador?: string;
        descricao?: string;
        metadados?: any;
    }): Observable<{ carteira: CarteiraDto; transacao: TransacaoCarteiraDto }> {
        return this.http.post<{ carteira: CarteiraDto; transacao: TransacaoCarteiraDto }>(
            `${this.rootUrl}/Financeiro/Carteira/Deposito`,
            dados
        );
    }

    /**
     * Realiza o pagamento de uma fatura utilizando o saldo da carteira
     */
    pagarFatura(dados: {
        faturaId: string;
        valor: number;
        descricao?: string;
        metadados?: any;
    }): Observable<{ carteira: CarteiraDto; transacao: TransacaoCarteiraDto }> {
        return this.http.post<{ carteira: CarteiraDto; transacao: TransacaoCarteiraDto }>(
            `${this.rootUrl}/Financeiro/Carteira/PagarFatura`,
            dados
        );
    }

    /**
     * Consulta o histórico completo de transações da carteira com filtros
     */
    listarTransacoes(filtros?: {
        tipo?: 'ENTRADA' | 'SAIDA';
        categoria?: string;
        take?: number;
        skip?: number;
    }): Observable<{ transacoes: TransacaoCarteiraDto[]; total: number }> {
        let params = new HttpParams();
        if (filtros?.tipo) params = params.set('tipo', filtros.tipo);
        if (filtros?.categoria) params = params.set('categoria', filtros.categoria);
        if (filtros?.take) params = params.set('take', filtros.take.toString());
        if (filtros?.skip) params = params.set('skip', filtros.skip.toString());

        return this.http.get<{ transacoes: TransacaoCarteiraDto[]; total: number }>(
            `${this.rootUrl}/Financeiro/Carteira/Transacoes`,
            { params }
        );
    }
}
