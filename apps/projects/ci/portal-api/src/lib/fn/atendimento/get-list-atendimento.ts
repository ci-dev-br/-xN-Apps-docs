/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { Atendimento } from '../../models/atendimento';
import { ObterListaAtendimento } from '../../models/obter-lista-atendimento';

export interface GetListAtendimento$Params {
      body: ObterListaAtendimento
}

export function getListAtendimento(http: HttpClient, rootUrl: string, params: GetListAtendimento$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<Atendimento>>> {
  const rb = new RequestBuilder(rootUrl, getListAtendimento.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<Atendimento>>;
    })
  );
}

getListAtendimento.PATH = '/Atendimento/GetList';
