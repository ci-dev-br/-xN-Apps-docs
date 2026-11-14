/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';
import { CarteiraDto, TransacaoCarteiraDto, VisaoGeralCarteiraDto } from '../../custom/portal-api-extensions';

import { carteiraAvaliarRoleDeveloper } from '../fn/carteira/carteira-avaliar-role-developer';
import { CarteiraAvaliarRoleDeveloper$Params } from '../fn/carteira/carteira-avaliar-role-developer';
import { carteiraGetMinha } from '../fn/carteira/carteira-get-minha';
import { CarteiraGetMinha$Params } from '../fn/carteira/carteira-get-minha';
import { carteiraListarTransacoes } from '../fn/carteira/carteira-listar-transacoes';
import { CarteiraListarTransacoes$Params } from '../fn/carteira/carteira-listar-transacoes';
import { carteiraPagarFatura } from '../fn/carteira/carteira-pagar-fatura';
import { CarteiraPagarFatura$Params } from '../fn/carteira/carteira-pagar-fatura';
import { carteiraRegistrarDeposito } from '../fn/carteira/carteira-registrar-deposito';
import { CarteiraRegistrarDeposito$Params } from '../fn/carteira/carteira-registrar-deposito';

@Injectable()
export class CarteiraService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `carteiraGetMinha()` */
  static readonly CarteiraGetMinhaPath = '/Financeiro/Carteira/Minha';

  /**
   * Obtém a carteira do usuário com saldo e histórico recente.
   *
   *
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `carteiraGetMinha()` instead.
   *
   * This method doesn't expect any request body.
   */
  carteiraGetMinha$Response(params?: CarteiraGetMinha$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return carteiraGetMinha(this.http, this.rootUrl, params, context);
  }

  /**
   * Obtém a carteira do usuário com saldo e histórico recente.
   *
   *
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `carteiraGetMinha$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  carteiraGetMinha(params?: CarteiraGetMinha$Params, context?: HttpContext): Observable<void> {
    return this.carteiraGetMinha$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `carteiraRegistrarDeposito()` */
  static readonly CarteiraRegistrarDepositoPath = '/Financeiro/Carteira/Deposito';

  /**
   * Registra um depósito identificado e adiciona saldo.
   *
   *
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `carteiraRegistrarDeposito()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  carteiraRegistrarDeposito$Response(params: CarteiraRegistrarDeposito$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return carteiraRegistrarDeposito(this.http, this.rootUrl, params, context);
  }

  /**
   * Registra um depósito identificado e adiciona saldo.
   *
   *
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `carteiraRegistrarDeposito$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  carteiraRegistrarDeposito(params: CarteiraRegistrarDeposito$Params, context?: HttpContext): Observable<void> {
    return this.carteiraRegistrarDeposito$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `carteiraPagarFatura()` */
  static readonly CarteiraPagarFaturaPath = '/Financeiro/Carteira/PagarFatura';

  /**
   * Paga uma fatura utilizando o saldo disponível na carteira.
   *
   *
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `carteiraPagarFatura()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  carteiraPagarFatura$Response(params: CarteiraPagarFatura$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return carteiraPagarFatura(this.http, this.rootUrl, params, context);
  }

  /**
   * Paga uma fatura utilizando o saldo disponível na carteira.
   *
   *
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `carteiraPagarFatura$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  carteiraPagarFatura(params: CarteiraPagarFatura$Params, context?: HttpContext): Observable<void> {
    return this.carteiraPagarFatura$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `carteiraListarTransacoes()` */
  static readonly CarteiraListarTransacoesPath = '/Financeiro/Carteira/Transacoes';

  /**
   * Lista extrato de movimentações da carteira.
   *
   *
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `carteiraListarTransacoes()` instead.
   *
   * This method doesn't expect any request body.
   */
  carteiraListarTransacoes$Response(params: CarteiraListarTransacoes$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return carteiraListarTransacoes(this.http, this.rootUrl, params, context);
  }

  /**
   * Lista extrato de movimentações da carteira.
   *
   *
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `carteiraListarTransacoes$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  carteiraListarTransacoes(params: CarteiraListarTransacoes$Params, context?: HttpContext): Observable<void> {
    return this.carteiraListarTransacoes$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `carteiraAvaliarRoleDeveloper()` */
  static readonly CarteiraAvaliarRoleDeveloperPath = '/Financeiro/Carteira/AvaliarRoleDeveloper';

  /**
   * Avalia e concede a ROLE DEVELOPER de cortesia por autoria e saldo.
   *
   *
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `carteiraAvaliarRoleDeveloper()` instead.
   *
   * This method doesn't expect any request body.
   */
  carteiraAvaliarRoleDeveloper$Response(params?: CarteiraAvaliarRoleDeveloper$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return carteiraAvaliarRoleDeveloper(this.http, this.rootUrl, params, context);
  }

  /**
   * Avalia e concede a ROLE DEVELOPER de cortesia por autoria e saldo.
   *
   *
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `carteiraAvaliarRoleDeveloper$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  carteiraAvaliarRoleDeveloper(params?: CarteiraAvaliarRoleDeveloper$Params, context?: HttpContext): Observable<void> {
    return this.carteiraAvaliarRoleDeveloper$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /**
   * Obtém a visão geral da carteira do usuário autenticado.
   * Se autoCreate for false (padrão), não cria carteira automaticamente e retorna possuiCarteira = false.
   */
  obterMinhaCarteira(autoCreate?: boolean): Observable<VisaoGeralCarteiraDto> {
    const qs = autoCreate ? '?autoCreate=true' : '';
    return this.http.get<VisaoGeralCarteiraDto>(`${this.rootUrl}/Financeiro/Carteira/Minha${qs}`);
  }

  /**
   * Cria explicitamente uma nova carteira digital para o usuário autenticado.
   */
  criarCarteira(dados?: {
    moeda?: string;
    limiteDiario?: number;
    termosAceitos?: boolean;
  }): Observable<{ possuiCarteira: boolean; carteira: CarteiraDto; criada: boolean }> {
    return this.http.post<{ possuiCarteira: boolean; carteira: CarteiraDto; criada: boolean }>(
      `${this.rootUrl}/Financeiro/Carteira/Criar`,
      dados || {}
    );
  }

  /**
   * Registra um depósito identificado na carteira do usuário.
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
   * Realiza o pagamento de uma fatura utilizando o saldo da carteira.
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
   * Lista transações da carteira com filtros opcionais.
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
   * Avalia e concede a ROLE DEVELOPER de cortesia por autoria e saldo.
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
