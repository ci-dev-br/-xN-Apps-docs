/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SitePost } from '../../models/site-post';
import { SyncPayloadDaoSitePost } from '../../models/sync-payload-dao-site-post';

export interface SyncSitePost$Params {
      body: SyncPayloadDaoSitePost
}

export function syncSitePost(http: HttpClient, rootUrl: string, params: SyncSitePost$Params, context?: HttpContext): Observable<StrictHttpResponse<SitePost>> {
  const rb = new RequestBuilder(rootUrl, syncSitePost.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SitePost>;
    })
  );
}

syncSitePost.PATH = '/SitePost/Sync';
