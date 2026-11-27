/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ObterListaIcon } from '../../models/obter-lista-icon';
import { SyncPayloadDaoIcon } from '../../models/sync-payload-dao-icon';

export interface GetListIcon$Params {
      body: ObterListaIcon
}

export function getListIcon(http: HttpClient, rootUrl: string, params: GetListIcon$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDaoIcon>> {
  const rb = new RequestBuilder(rootUrl, getListIcon.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SyncPayloadDaoIcon>;
    })
  );
}

getListIcon.PATH = '/Icon/GetList';
