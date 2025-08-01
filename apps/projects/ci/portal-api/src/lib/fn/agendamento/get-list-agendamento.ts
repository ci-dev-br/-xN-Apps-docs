/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { Agendamento } from '../../models/agendamento';
import { ObterListaAgendamento } from '../../models/obter-lista-agendamento';

export interface GetListAgendamento$Params {
      body: ObterListaAgendamento
}

export function getListAgendamento(http: HttpClient, rootUrl: string, params: GetListAgendamento$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<Agendamento>>> {
  const rb = new RequestBuilder(rootUrl, getListAgendamento.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<Agendamento>>;
    })
  );
}

getListAgendamento.PATH = '/Agendamento/GetList';
