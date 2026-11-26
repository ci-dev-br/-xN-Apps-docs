/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { indicatorsControllerGetIndicators } from '../fn/analise-fundamentalista/indicators-controller-get-indicators';
import { IndicatorsControllerGetIndicators$Params } from '../fn/analise-fundamentalista/indicators-controller-get-indicators';

@Injectable()
export class AnaliseFundamentalistaService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `indicatorsControllerGetIndicators()` */
  static readonly IndicatorsControllerGetIndicatorsPath = '/indicators/{ticker}';

  /**
   * Obtém indicadores fundamentalistas (P/L, P/VP) de um ativo na data atual ou especificada.
   *
   *
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `indicatorsControllerGetIndicators()` instead.
   *
   * This method doesn't expect any request body.
   */
  indicatorsControllerGetIndicators$Response(params: IndicatorsControllerGetIndicators$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return indicatorsControllerGetIndicators(this.http, this.rootUrl, params, context);
  }

  /**
   * Obtém indicadores fundamentalistas (P/L, P/VP) de um ativo na data atual ou especificada.
   *
   *
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `indicatorsControllerGetIndicators$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  indicatorsControllerGetIndicators(params: IndicatorsControllerGetIndicators$Params, context?: HttpContext): Observable<void> {
    return this.indicatorsControllerGetIndicators$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

}
