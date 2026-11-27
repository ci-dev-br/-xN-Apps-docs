/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { Produto } from '../../models/produto';

export interface DeleteProduto$Params {
      body: Produto
}

export function deleteProduto(http: HttpClient, rootUrl: string, params: DeleteProduto$Params, context?: HttpContext): Observable<StrictHttpResponse<Produto>> {
  const rb = new RequestBuilder(rootUrl, deleteProduto.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Produto>;
    })
  );
}

deleteProduto.PATH = '/Produto/Delete';
