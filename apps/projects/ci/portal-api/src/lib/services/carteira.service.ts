/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

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

}
