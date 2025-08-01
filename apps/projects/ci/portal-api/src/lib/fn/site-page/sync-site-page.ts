/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SitePage } from '../../models/site-page';
import { SyncPayloadDaoSitePage } from '../../models/sync-payload-dao-site-page';

export interface SyncSitePage$Params {
      body: SyncPayloadDaoSitePage
}

export function syncSitePage(http: HttpClient, rootUrl: string, params: SyncSitePage$Params, context?: HttpContext): Observable<StrictHttpResponse<SitePage>> {
  const rb = new RequestBuilder(rootUrl, syncSitePage.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SitePage>;
    })
  );
}

syncSitePage.PATH = '/SitePage/Sync';
