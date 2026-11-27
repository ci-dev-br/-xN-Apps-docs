/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { Agendamento } from '../../models/agendamento';

export interface DeleteAgendamento$Params {
      body: Agendamento
}

export function deleteAgendamento(http: HttpClient, rootUrl: string, params: DeleteAgendamento$Params, context?: HttpContext): Observable<StrictHttpResponse<Agendamento>> {
  const rb = new RequestBuilder(rootUrl, deleteAgendamento.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Agendamento>;
    })
  );
}

deleteAgendamento.PATH = '/Agendamento/Delete';
