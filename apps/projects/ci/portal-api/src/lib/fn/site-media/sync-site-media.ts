/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SiteMedia } from '../../models/site-media';
import { SyncPayloadDaoSiteMedia } from '../../models/sync-payload-dao-site-media';

export interface SyncSiteMedia$Params {
      body: SyncPayloadDaoSiteMedia
}

export function syncSiteMedia(http: HttpClient, rootUrl: string, params: SyncSiteMedia$Params, context?: HttpContext): Observable<StrictHttpResponse<SiteMedia>> {
  const rb = new RequestBuilder(rootUrl, syncSiteMedia.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SiteMedia>;
    })
  );
}

syncSiteMedia.PATH = '/SiteMedia/Sync';
