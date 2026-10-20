/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';


export interface FinancialsControllerGetLatest$Params {
  ticker: string;
}

export function financialsControllerGetLatest(http: HttpClient, rootUrl: string, params: FinancialsControllerGetLatest$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
  const rb = new RequestBuilder(rootUrl, financialsControllerGetLatest.PATH, 'get');
  if (params) {
    rb.path('ticker', params.ticker, {});
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

financialsControllerGetLatest.PATH = '/api/companies/financials/{ticker}/latest';
