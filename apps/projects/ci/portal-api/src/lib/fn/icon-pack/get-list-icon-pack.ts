/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ObterListaIconPack } from '../../models/obter-lista-icon-pack';
import { SyncPayloadDaoIconPack } from '../../models/sync-payload-dao-icon-pack';

export interface GetListIconPack$Params {
      body: ObterListaIconPack
}

export function getListIconPack(http: HttpClient, rootUrl: string, params: GetListIconPack$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDaoIconPack>> {
  const rb = new RequestBuilder(rootUrl, getListIconPack.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SyncPayloadDaoIconPack>;
    })
  );
}

getListIconPack.PATH = '/IconPack/GetList';
