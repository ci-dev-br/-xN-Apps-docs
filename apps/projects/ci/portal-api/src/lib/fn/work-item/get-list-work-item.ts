/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ObterListaWorkItem } from '../../models/obter-lista-work-item';
import { SyncPayloadDaoWorkItem } from '../../models/sync-payload-dao-work-item';

export interface GetListWorkItem$Params {
      body: ObterListaWorkItem
}

export function getListWorkItem(http: HttpClient, rootUrl: string, params: GetListWorkItem$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDaoWorkItem>> {
  const rb = new RequestBuilder(rootUrl, getListWorkItem.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SyncPayloadDaoWorkItem>;
    })
  );
}

getListWorkItem.PATH = '/WorkItem/GetList';
