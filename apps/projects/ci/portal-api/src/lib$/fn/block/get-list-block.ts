/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ObterListaBlock } from '../../models/obter-lista-block';
import { SyncPayloadDaoBlock } from '../../models/sync-payload-dao-block';

export interface GetListBlock$Params {
      body: ObterListaBlock
}

export function getListBlock(http: HttpClient, rootUrl: string, params: GetListBlock$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDaoBlock>> {
  const rb = new RequestBuilder(rootUrl, getListBlock.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SyncPayloadDaoBlock>;
    })
  );
}

getListBlock.PATH = '/Block/GetList';
