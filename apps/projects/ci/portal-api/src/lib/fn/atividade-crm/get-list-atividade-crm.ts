/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { AtividadeCrm } from '../../models/atividade-crm';
import { ObterListaAtividadeCrm } from '../../models/obter-lista-atividade-crm';

export interface GetListAtividadeCrm$Params {
      body: ObterListaAtividadeCrm
}

export function getListAtividadeCrm(http: HttpClient, rootUrl: string, params: GetListAtividadeCrm$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<AtividadeCrm>>> {
  const rb = new RequestBuilder(rootUrl, getListAtividadeCrm.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<AtividadeCrm>>;
    })
  );
}

getListAtividadeCrm.PATH = '/AtividadeCrm/GetList';
