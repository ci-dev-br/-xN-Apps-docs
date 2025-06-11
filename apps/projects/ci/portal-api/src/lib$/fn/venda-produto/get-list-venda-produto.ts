/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ObterListaVendaProduto } from '../../models/obter-lista-venda-produto';
import { VendaProduto } from '../../models/venda-produto';

export interface GetListVendaProduto$Params {
      body: ObterListaVendaProduto
}

export function getListVendaProduto(http: HttpClient, rootUrl: string, params: GetListVendaProduto$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<VendaProduto>>> {
  const rb = new RequestBuilder(rootUrl, getListVendaProduto.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<VendaProduto>>;
    })
  );
}

getListVendaProduto.PATH = '/VendaProduto/GetList';
