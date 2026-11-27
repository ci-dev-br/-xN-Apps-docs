/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { Promocao } from '../../models/promocao';

export interface DeletePromocao$Params {
      body: Promocao
}

export function deletePromocao(http: HttpClient, rootUrl: string, params: DeletePromocao$Params, context?: HttpContext): Observable<StrictHttpResponse<Promocao>> {
  const rb = new RequestBuilder(rootUrl, deletePromocao.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Promocao>;
    })
  );
}

deletePromocao.PATH = '/Promocao/Delete';
