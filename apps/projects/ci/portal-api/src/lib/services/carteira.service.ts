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
     * Efetua o pagamento de uma fatura utilizando o saldo da carteira
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
     * Lista transações paginadas e filtradas da carteira
     */
    listarTransacoes(params?: {
        tipo?: 'ENTRADA' | 'SAIDA';
        categoria?: string;
        de?: string;
        ate?: string;
        pagina?: number;
        limite?: number;
    }): Observable<{ itens: TransacaoCarteiraDto[]; total: number; pagina: number }> {
        let httpParams = new HttpParams();
        if (params?.tipo) httpParams = httpParams.set('tipo', params.tipo);
        if (params?.categoria) httpParams = httpParams.set('categoria', params.categoria);
        if (params?.de) httpParams = httpParams.set('de', params.de);
        if (params?.ate) httpParams = httpParams.set('ate', params.ate);
        if (params?.pagina) httpParams = httpParams.set('pagina', params.pagina.toString());
        if (params?.limite) httpParams = httpParams.set('limite', params.limite.toString());

        return this.http.get<{ itens: TransacaoCarteiraDto[]; total: number; pagina: number }>(
            `${this.rootUrl}/Financeiro/Carteira/Transacoes`,
            { params: httpParams }
        );
    }

    /**
     * Solicita a avaliação de elegibilidade para a concessão da ROLE DEVELOPER como cortesia.
     * Requisitos: e-mail verificado, autoria comprovada no projeto (PR aceito na branch development) e saldo >= 50.
     */
    avaliarRoleDeveloper(): Observable<{
        promovido: boolean;
        motivo: string;
        user?: { id: string; email: string; roles: string[]; emailVerificado: boolean };
        saldoAtual?: number;
    }> {
        return this.http.post<{
            promovido: boolean;
            motivo: string;
            user?: { id: string; email: string; roles: string[]; emailVerificado: boolean };
            saldoAtual?: number;
        }>(`${this.rootUrl}/Financeiro/Carteira/AvaliarRoleDeveloper`, {});
    }
}
