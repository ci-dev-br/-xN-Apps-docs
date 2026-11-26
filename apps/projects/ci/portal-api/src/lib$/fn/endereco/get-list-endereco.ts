/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ObterListaEndereco } from '../../models/obter-lista-endereco';
import { SyncPayloadDaoEndereco } from '../../models/sync-payload-dao-endereco';

export interface GetListEndereco$Params {
      body: ObterListaEndereco
}

export function getListEndereco(http: HttpClient, rootUrl: string, params: GetListEndereco$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDaoEndereco>> {
  const rb = new RequestBuilder(rootUrl, getListEndereco.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SyncPayloadDaoEndereco>;
    })
  );
}

getListEndereco.PATH = '/Endereco/Get';
