/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { MacroIndicator } from '../models/macro-indicator';
import { macroIndicatorsControllerGetCrypto } from '../fn/indicadores-macroeconomicos/macro-indicators-controller-get-crypto';
import { MacroIndicatorsControllerGetCrypto$Params } from '../fn/indicadores-macroeconomicos/macro-indicators-controller-get-crypto';
import { macroIndicatorsControllerGetLatest } from '../fn/indicadores-macroeconomicos/macro-indicators-controller-get-latest';
import { MacroIndicatorsControllerGetLatest$Params } from '../fn/indicadores-macroeconomicos/macro-indicators-controller-get-latest';
import { macroIndicatorsControllerTriggerSync } from '../fn/indicadores-macroeconomicos/macro-indicators-controller-trigger-sync';
import { MacroIndicatorsControllerTriggerSync$Params } from '../fn/indicadores-macroeconomicos/macro-indicators-controller-trigger-sync';

@Injectable()
export class IndicadoresMacroeconomicosService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `macroIndicatorsControllerGetLatest()` */
  static readonly MacroIndicatorsControllerGetLatestPath = '/api/macro-indicators/latest';

  /**
   * Obtém os últimos indicadores macroeconômicos.
   *
   * Retorna a cotação/valor mais recente registrada na base para cada indicador (Selic, CDI, IPCA, IGP-M, Dólar, Euro, Poupança) com fonte, data de extração na fonte (extractedAt) e data da consulta na base (queriedAt).
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `macroIndicatorsControllerGetLatest()` instead.
   *
   * This method doesn't expect any request body.
   */
  macroIndicatorsControllerGetLatest$Response(params?: MacroIndicatorsControllerGetLatest$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<MacroIndicator>>> {
    return macroIndicatorsControllerGetLatest(this.http, this.rootUrl, params, context);
  }

  /**
   * Obtém os últimos indicadores macroeconômicos.
   *
   * Retorna a cotação/valor mais recente registrada na base para cada indicador (Selic, CDI, IPCA, IGP-M, Dólar, Euro, Poupança) com fonte, data de extração na fonte (extractedAt) e data da consulta na base (queriedAt).
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `macroIndicatorsControllerGetLatest$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  macroIndicatorsControllerGetLatest(params?: MacroIndicatorsControllerGetLatest$Params, context?: HttpContext): Observable<Array<MacroIndicator>> {
    return this.macroIndicatorsControllerGetLatest$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<MacroIndicator>>): Array<MacroIndicator> => r.body)
    );
  }

  /** Path part for operation `macroIndicatorsControllerGetCrypto()` */
  static readonly MacroIndicatorsControllerGetCryptoPath = '/api/macro-indicators/crypto';

  /**
   * Obtém índices e cotações públicas de criptomoedas.
   *
   * Retorna cotações e índices cripto (BTC, ETH, SOL, BNB, XRP, ADA, DOGE, Medo & Ganância, Dominância BTC e Market Cap) via APIs públicas (CoinGecko, Alternative.me, AwesomeAPI, Binance) com extractedAt e queriedAt.
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `macroIndicatorsControllerGetCrypto()` instead.
   *
   * This method doesn't expect any request body.
   */
  macroIndicatorsControllerGetCrypto$Response(params?: MacroIndicatorsControllerGetCrypto$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<MacroIndicator>>> {
    return macroIndicatorsControllerGetCrypto(this.http, this.rootUrl, params, context);
  }

  /**
   * Obtém índices e cotações públicas de criptomoedas.
   *
   * Retorna cotações e índices cripto (BTC, ETH, SOL, BNB, XRP, ADA, DOGE, Medo & Ganância, Dominância BTC e Market Cap) via APIs públicas (CoinGecko, Alternative.me, AwesomeAPI, Binance) com extractedAt e queriedAt.
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `macroIndicatorsControllerGetCrypto$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  macroIndicatorsControllerGetCrypto(params?: MacroIndicatorsControllerGetCrypto$Params, context?: HttpContext): Observable<Array<MacroIndicator>> {
    return this.macroIndicatorsControllerGetCrypto$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<MacroIndicator>>): Array<MacroIndicator> => r.body)
    );
  }

  /** Path part for operation `macroIndicatorsControllerTriggerSync()` */
  static readonly MacroIndicatorsControllerTriggerSyncPath = '/api/macro-indicators/sync';

  /**
   * Força a sincronização dos indicadores macro, cripto e microeconômicos.
   *
   * Aciona manualmente a coleta atualizada de macroindicadores (BCB/Câmbio), índices cripto e microindicadores (cotações B3).
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `macroIndicatorsControllerTriggerSync()` instead.
   *
   * This method doesn't expect any request body.
   */
  macroIndicatorsControllerTriggerSync$Response(params?: MacroIndicatorsControllerTriggerSync$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return macroIndicatorsControllerTriggerSync(this.http, this.rootUrl, params, context);
  }

  /**
   * Força a sincronização dos indicadores macro, cripto e microeconômicos.
   *
   * Aciona manualmente a coleta atualizada de macroindicadores (BCB/Câmbio), índices cripto e microindicadores (cotações B3).
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `macroIndicatorsControllerTriggerSync$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  macroIndicatorsControllerTriggerSync(params?: MacroIndicatorsControllerTriggerSync$Params, context?: HttpContext): Observable<void> {
    return this.macroIndicatorsControllerTriggerSync$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

}
