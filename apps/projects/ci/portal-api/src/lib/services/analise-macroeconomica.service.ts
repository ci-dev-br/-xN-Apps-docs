/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { inflationControllerGetInflationAdjustment } from '../fn/analise-macroeconomica/inflation-controller-get-inflation-adjustment';
import { InflationControllerGetInflationAdjustment$Params } from '../fn/analise-macroeconomica/inflation-controller-get-inflation-adjustment';

@Injectable()
export class AnaliseMacroeconomicaService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `inflationControllerGetInflationAdjustment()` */
  static readonly InflationControllerGetInflationAdjustmentPath = '/analysis/inflation/{ticker}';

  /**
   * Ajusta o preço histórico de um ativo pela inflação (IPCA).
   *
   * Calcula o valor presente de uma ação baseado na inflação acumulada no período, retornando a rentabilidade real vs nominal.
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `inflationControllerGetInflationAdjustment()` instead.
   *
   * This method doesn't expect any request body.
   */
  inflationControllerGetInflationAdjustment$Response(params: InflationControllerGetInflationAdjustment$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return inflationControllerGetInflationAdjustment(this.http, this.rootUrl, params, context);
  }

  /**
   * Ajusta o preço histórico de um ativo pela inflação (IPCA).
   *
   * Calcula o valor presente de uma ação baseado na inflação acumulada no período, retornando a rentabilidade real vs nominal.
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `inflationControllerGetInflationAdjustment$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  inflationControllerGetInflationAdjustment(params: InflationControllerGetInflationAdjustment$Params, context?: HttpContext): Observable<void> {
    return this.inflationControllerGetInflationAdjustment$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

}
