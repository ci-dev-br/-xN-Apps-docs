/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SyncPayloadDaoCategory } from '../../models/sync-payload-dao-category';

export interface SyncCategory$Params {
      body: SyncPayloadDaoCategory
}

export function syncCategory(http: HttpClient, rootUrl: string, params: SyncCategory$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDaoCategory>> {
  const rb = new RequestBuilder(rootUrl, syncCategory.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SyncPayloadDaoCategory>;
    })
  );
}

syncCategory.PATH = '/Category/Sync';
