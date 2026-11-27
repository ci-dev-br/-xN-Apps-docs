/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SeoDomain } from '../../models/seo-domain';
import { SyncPayloadDaoSeoDomain } from '../../models/sync-payload-dao-seo-domain';

export interface SyncSeoDomain$Params {
      body: SyncPayloadDaoSeoDomain
}

export function syncSeoDomain(http: HttpClient, rootUrl: string, params: SyncSeoDomain$Params, context?: HttpContext): Observable<StrictHttpResponse<SeoDomain>> {
  const rb = new RequestBuilder(rootUrl, syncSeoDomain.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SeoDomain>;
    })
  );
}

syncSeoDomain.PATH = '/SeoDomain/Sync';
