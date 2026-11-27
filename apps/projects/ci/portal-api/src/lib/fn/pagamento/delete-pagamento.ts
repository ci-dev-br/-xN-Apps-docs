/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { Pagamento } from '../../models/pagamento';

export interface DeletePagamento$Params {
      body: Pagamento
}

export function deletePagamento(http: HttpClient, rootUrl: string, params: DeletePagamento$Params, context?: HttpContext): Observable<StrictHttpResponse<Pagamento>> {
  const rb = new RequestBuilder(rootUrl, deletePagamento.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Pagamento>;
    })
  );
}

deletePagamento.PATH = '/Pagamento/Delete';
