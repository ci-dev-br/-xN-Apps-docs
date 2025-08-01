/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ObterListaProjeto } from '../../models/obter-lista-projeto';
import { SyncPayloadDaoProjeto } from '../../models/sync-payload-dao-projeto';

export interface GetListProjeto$Params {
      body: ObterListaProjeto
}

export function getListProjeto(http: HttpClient, rootUrl: string, params: GetListProjeto$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDaoProjeto>> {
  const rb = new RequestBuilder(rootUrl, getListProjeto.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SyncPayloadDaoProjeto>;
    })
  );
}

getListProjeto.PATH = '/Projeto/GetList';
