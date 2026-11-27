/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { quotesControllerGetRecent } from '../fn/cotacoes-b-3/quotes-controller-get-recent';
import { QuotesControllerGetRecent$Params } from '../fn/cotacoes-b-3/quotes-controller-get-recent';
import { quotesControllerTriggerSync } from '../fn/cotacoes-b-3/quotes-controller-trigger-sync';
import { QuotesControllerTriggerSync$Params } from '../fn/cotacoes-b-3/quotes-controller-trigger-sync';

@Injectable()
export class CotacoesB3Service extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `quotesControllerGetRecent()` */
  static readonly QuotesControllerGetRecentPath = '/api/quotes/{ticker}/recent';

  /**
   * Obtém as cotações mais recentes com cálculo de variação diária.
   *
   *
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `quotesControllerGetRecent()` instead.
   *
   * This method doesn't expect any request body.
   */
  quotesControllerGetRecent$Response(params: QuotesControllerGetRecent$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return quotesControllerGetRecent(this.http, this.rootUrl, params, context);
  }

  /**
   * Obtém as cotações mais recentes com cálculo de variação diária.
   *
   *
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `quotesControllerGetRecent$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  quotesControllerGetRecent(params: QuotesControllerGetRecent$Params, context?: HttpContext): Observable<void> {
    return this.quotesControllerGetRecent$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `quotesControllerTriggerSync()` */
  static readonly QuotesControllerTriggerSyncPath = '/api/quotes/sync';

  /**
   * Força a sincronização das cotações da B3.
   *
   * Aciona manualmente a coleta atualizada dos ativos e índices da B3.
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `quotesControllerTriggerSync()` instead.
   *
   * This method doesn't expect any request body.
   */
  quotesControllerTriggerSync$Response(params?: QuotesControllerTriggerSync$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return quotesControllerTriggerSync(this.http, this.rootUrl, params, context);
  }

  /**
   * Força a sincronização das cotações da B3.
   *
   * Aciona manualmente a coleta atualizada dos ativos e índices da B3.
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `quotesControllerTriggerSync$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  quotesControllerTriggerSync(params?: QuotesControllerTriggerSync$Params, context?: HttpContext): Observable<void> {
    return this.quotesControllerTriggerSync$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

}
