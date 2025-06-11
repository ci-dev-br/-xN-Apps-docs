/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ObterListaInformacaoContato } from '../../models/obter-lista-informacao-contato';
import { SyncPayloadDaoInformacaoContato } from '../../models/sync-payload-dao-informacao-contato';

export interface GetListInformacaoContato$Params {
      body: ObterListaInformacaoContato
}

export function getListInformacaoContato(http: HttpClient, rootUrl: string, params: GetListInformacaoContato$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDaoInformacaoContato>> {
  const rb = new RequestBuilder(rootUrl, getListInformacaoContato.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SyncPayloadDaoInformacaoContato>;
    })
  );
}

getListInformacaoContato.PATH = '/InformacaoContato/GetList';
