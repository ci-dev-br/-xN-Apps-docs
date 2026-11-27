/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { VendaProduto } from '../../models/venda-produto';

export interface DeleteVendaProduto$Params {
      body: VendaProduto
}

export function deleteVendaProduto(http: HttpClient, rootUrl: string, params: DeleteVendaProduto$Params, context?: HttpContext): Observable<StrictHttpResponse<VendaProduto>> {
  const rb = new RequestBuilder(rootUrl, deleteVendaProduto.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<VendaProduto>;
    })
  );
}

deleteVendaProduto.PATH = '/VendaProduto/Delete';
