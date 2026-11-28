/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { AnotacaoEstudo } from '../../models/anotacao-estudo';
import { ObterListaAnotacaoEstudo } from '../../models/obter-lista-anotacao-estudo';

export interface GetListAnotacaoEstudo$Params {
      body: ObterListaAnotacaoEstudo
}

export function getListAnotacaoEstudo(http: HttpClient, rootUrl: string, params: GetListAnotacaoEstudo$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<AnotacaoEstudo>>> {
  const rb = new RequestBuilder(rootUrl, getListAnotacaoEstudo.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<AnotacaoEstudo>>;
    })
  );
}

getListAnotacaoEstudo.PATH = '/AnotacaoEstudo/GetList';
