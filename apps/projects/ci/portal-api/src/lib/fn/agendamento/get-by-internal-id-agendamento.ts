/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { Agendamento } from '../../models/agendamento';
import { GetByInternalIdInputDto } from '../../models/get-by-internal-id-input-dto';

export interface GetByInternalIdAgendamento$Params {
      body: GetByInternalIdInputDto
}

export function getByInternalIdAgendamento(http: HttpClient, rootUrl: string, params: GetByInternalIdAgendamento$Params, context?: HttpContext): Observable<StrictHttpResponse<Agendamento>> {
  const rb = new RequestBuilder(rootUrl, getByInternalIdAgendamento.PATH, 'post');
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

getByInternalIdAgendamento.PATH = '/Agendamento/GetByInternalId';
