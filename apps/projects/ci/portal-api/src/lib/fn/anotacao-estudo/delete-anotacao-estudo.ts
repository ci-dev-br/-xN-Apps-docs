/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { AnotacaoEstudo } from '../../models/anotacao-estudo';

export interface DeleteAnotacaoEstudo$Params {
      body: AnotacaoEstudo
}

export function deleteAnotacaoEstudo(http: HttpClient, rootUrl: string, params: DeleteAnotacaoEstudo$Params, context?: HttpContext): Observable<StrictHttpResponse<AnotacaoEstudo>> {
  const rb = new RequestBuilder(rootUrl, deleteAnotacaoEstudo.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<AnotacaoEstudo>;
    })
  );
}

deleteAnotacaoEstudo.PATH = '/AnotacaoEstudo/Delete';
