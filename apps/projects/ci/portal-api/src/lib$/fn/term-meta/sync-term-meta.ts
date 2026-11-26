/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SyncPayloadDaoTermMeta } from '../../models/sync-payload-dao-term-meta';
import { TermMeta } from '../../models/term-meta';

export interface SyncTermMeta$Params {
      body: SyncPayloadDaoTermMeta
}

export function syncTermMeta(http: HttpClient, rootUrl: string, params: SyncTermMeta$Params, context?: HttpContext): Observable<StrictHttpResponse<TermMeta>> {
  const rb = new RequestBuilder(rootUrl, syncTermMeta.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<TermMeta>;
    })
  );
}

syncTermMeta.PATH = '/TermMeta/Sync';
