/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';


export interface InflationControllerGetInflationAdjustment$Params {

/**
 * Ticker do ativo negociado na B3
 */
  ticker: string;

/**
 * Data de início (compra do ativo) no formato YYYY-MM-DD
 */
  startDate: string;

/**
 * Data final da análise (Opcional, o padrão é a data atual)
 */
  endDate?: string;
}

export function inflationControllerGetInflationAdjustment(http: HttpClient, rootUrl: string, params: InflationControllerGetInflationAdjustment$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
  const rb = new RequestBuilder(rootUrl, inflationControllerGetInflationAdjustment.PATH, 'post');
  if (params) {
    rb.path('ticker', params.ticker, {});
    rb.query('startDate', params.startDate, {});
    rb.query('endDate', params.endDate, {});
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

inflationControllerGetInflationAdjustment.PATH = '/analysis/inflation/{ticker}';
