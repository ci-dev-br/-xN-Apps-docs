/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { Atendimento } from '../../models/atendimento';

export interface DeleteAtendimento$Params {
      body: Atendimento
}

export function deleteAtendimento(http: HttpClient, rootUrl: string, params: DeleteAtendimento$Params, context?: HttpContext): Observable<StrictHttpResponse<Atendimento>> {
  const rb = new RequestBuilder(rootUrl, deleteAtendimento.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Atendimento>;
    })
  );
}

deleteAtendimento.PATH = '/Atendimento/Delete';
