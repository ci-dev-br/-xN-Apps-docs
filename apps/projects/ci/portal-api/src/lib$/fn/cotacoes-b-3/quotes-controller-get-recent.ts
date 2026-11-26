/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';


export interface QuotesControllerGetRecent$Params {
  ticker: string;

/**
 * Quantidade de dias a retornar (Padrão: 5)
 */
  days?: number;
}

export function quotesControllerGetRecent(http: HttpClient, rootUrl: string, params: QuotesControllerGetRecent$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
  const rb = new RequestBuilder(rootUrl, quotesControllerGetRecent.PATH, 'get');
  if (params) {
    rb.path('ticker', params.ticker, {});
    rb.query('days', params.days, {});
  }

  return http.request(
    rb.build({ responseType: 'text', accept: '*/*', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return (r as HttpResponse<any>).clone({ body: undefined }) as StrictHttpResponse<void>;
    })
  );
}

quotesControllerGetRecent.PATH = '/api/quotes/{ticker}/recent';
