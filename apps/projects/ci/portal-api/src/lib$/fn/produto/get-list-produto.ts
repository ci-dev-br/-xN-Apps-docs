/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ObterListaProduto } from '../../models/obter-lista-produto';
import { Produto } from '../../models/produto';

export interface GetListProduto$Params {
      body: ObterListaProduto
}

export function getListProduto(http: HttpClient, rootUrl: string, params: GetListProduto$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<Produto>>> {
  const rb = new RequestBuilder(rootUrl, getListProduto.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<Produto>>;
    })
  );
}

getListProduto.PATH = '/Produto/GetList';
