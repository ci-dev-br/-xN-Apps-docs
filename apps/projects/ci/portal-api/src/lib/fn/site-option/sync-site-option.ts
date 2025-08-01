/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SiteOption } from '../../models/site-option';
import { SyncPayloadDaoSiteOption } from '../../models/sync-payload-dao-site-option';

export interface SyncSiteOption$Params {
      body: SyncPayloadDaoSiteOption
}

export function syncSiteOption(http: HttpClient, rootUrl: string, params: SyncSiteOption$Params, context?: HttpContext): Observable<StrictHttpResponse<SiteOption>> {
  const rb = new RequestBuilder(rootUrl, syncSiteOption.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SiteOption>;
    })
  );
}

syncSiteOption.PATH = '/SiteOption/Sync';
