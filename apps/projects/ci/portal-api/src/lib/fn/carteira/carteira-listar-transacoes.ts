/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';


export interface CarteiraListarTransacoes$Params {
  tipo: string;
  categoria: string;
  take: string;
  skip: string;
}

export function carteiraListarTransacoes(http: HttpClient, rootUrl: string, params: CarteiraListarTransacoes$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
  const rb = new RequestBuilder(rootUrl, carteiraListarTransacoes.PATH, 'get');
  if (params) {
    rb.query('tipo', params.tipo, {});
    rb.query('categoria', params.categoria, {});
    rb.query('take', params.take, {});
    rb.query('skip', params.skip, {});
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

carteiraListarTransacoes.PATH = '/Financeiro/Carteira/Transacoes';
