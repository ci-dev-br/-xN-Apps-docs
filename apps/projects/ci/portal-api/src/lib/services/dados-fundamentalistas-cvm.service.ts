/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { financialsControllerGetLatest } from '../fn/dados-fundamentalistas-cvm/financials-controller-get-latest';
import { FinancialsControllerGetLatest$Params } from '../fn/dados-fundamentalistas-cvm/financials-controller-get-latest';

@Injectable()
export class DadosFundamentalistasCvmService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `financialsControllerGetLatest()` */
  static readonly FinancialsControllerGetLatestPath = '/api/companies/financials/{ticker}/latest';

  /**
   * Obtém o balanço e DRE mais recente de uma empresa pelo ticker.
   *
   *
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `financialsControllerGetLatest()` instead.
   *
   * This method doesn't expect any request body.
   */
  financialsControllerGetLatest$Response(params: FinancialsControllerGetLatest$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return financialsControllerGetLatest(this.http, this.rootUrl, params, context);
  }

  /**
   * Obtém o balanço e DRE mais recente de uma empresa pelo ticker.
   *
   *
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `financialsControllerGetLatest$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  financialsControllerGetLatest(params: FinancialsControllerGetLatest$Params, context?: HttpContext): Observable<void> {
    return this.financialsControllerGetLatest$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

}
