/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';


export interface CarteiraGetMinha$Params {
  autoCreate: string;
  carteiraId: string;
  periodo: string;
}

export function carteiraGetMinha(http: HttpClient, rootUrl: string, params: CarteiraGetMinha$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
  const rb = new RequestBuilder(rootUrl, carteiraGetMinha.PATH, 'get');
  if (params) {
    rb.query('autoCreate', params.autoCreate, {});
    rb.query('carteiraId', params.carteiraId, {});
    rb.query('periodo', params.periodo, {});
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

carteiraGetMinha.PATH = '/Financeiro/Carteira/Minha';
