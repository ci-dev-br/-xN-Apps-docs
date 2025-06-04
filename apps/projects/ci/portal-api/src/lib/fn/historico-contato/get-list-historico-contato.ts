/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { HistoricoContato } from '../../models/historico-contato';
import { ObterListaHistoricoContato } from '../../models/obter-lista-historico-contato';

export interface GetListHistoricoContato$Params {
      body: ObterListaHistoricoContato
}

export function getListHistoricoContato(http: HttpClient, rootUrl: string, params: GetListHistoricoContato$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<HistoricoContato>>> {
  const rb = new RequestBuilder(rootUrl, getListHistoricoContato.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<HistoricoContato>>;
    })
  );
}

getListHistoricoContato.PATH = '/HistoricoContato/GetList';
