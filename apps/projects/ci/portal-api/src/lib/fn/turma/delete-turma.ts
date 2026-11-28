/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { Turma } from '../../models/turma';

export interface DeleteTurma$Params {
      body: Turma
}

export function deleteTurma(http: HttpClient, rootUrl: string, params: DeleteTurma$Params, context?: HttpContext): Observable<StrictHttpResponse<Turma>> {
  const rb = new RequestBuilder(rootUrl, deleteTurma.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Turma>;
    })
  );
}

deleteTurma.PATH = '/Turma/Delete';
