/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SeoBackLink } from '../../models/seo-back-link';
import { SyncPayloadDaoSeoBackLink } from '../../models/sync-payload-dao-seo-back-link';

export interface SyncSeoBackLink$Params {
      body: SyncPayloadDaoSeoBackLink
}

export function syncSeoBackLink(http: HttpClient, rootUrl: string, params: SyncSeoBackLink$Params, context?: HttpContext): Observable<StrictHttpResponse<SeoBackLink>> {
  const rb = new RequestBuilder(rootUrl, syncSeoBackLink.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SeoBackLink>;
    })
  );
}

syncSeoBackLink.PATH = '/SeoBackLink/Sync';
