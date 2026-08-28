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
   * Obtém os últimos indicadores.
   *
   * Retorna a cotação/valor mais recente registrada no banco para cada indicador (Selic, Dólar, IPCA, etc).
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
   * Obtém os últimos indicadores.
   *
   * Retorna a cotação/valor mais recente registrada no banco para cada indicador (Selic, Dólar, IPCA, etc).
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

  /** Path part for operation `macroIndicatorsControllerTriggerSync()` */
  static readonly MacroIndicatorsControllerTriggerSyncPath = '/api/macro-indicators/sync';

  /**
   * Força a sincronização dos dados do Banco Central.
   *
   * Aciona manualmente a rotina do Scraper para baixar os últimos 60 dias de indicadores.
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
   * Força a sincronização dos dados do Banco Central.
   *
   * Aciona manualmente a rotina do Scraper para baixar os últimos 60 dias de indicadores.
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
