/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';


export interface CarteiraGetDashboard$Params {
  periodo: string;
  carteiraId: string;
  tenantIds: string;
}

export function carteiraGetDashboard(http: HttpClient, rootUrl: string, params: CarteiraGetDashboard$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
  const rb = new RequestBuilder(rootUrl, carteiraGetDashboard.PATH, 'get');
  if (params) {
    rb.query('periodo', params.periodo, {});
    rb.query('carteiraId', params.carteiraId, {});
    rb.query('tenantIds', params.tenantIds, {});
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

carteiraGetDashboard.PATH = '/Financeiro/Carteira/Dashboard';
