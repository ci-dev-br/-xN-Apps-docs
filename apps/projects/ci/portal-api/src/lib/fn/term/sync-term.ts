/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SyncPayloadDaoTerm } from '../../models/sync-payload-dao-term';
import { Term } from '../../models/term';

export interface SyncTerm$Params {
      body: SyncPayloadDaoTerm
}

export function syncTerm(http: HttpClient, rootUrl: string, params: SyncTerm$Params, context?: HttpContext): Observable<StrictHttpResponse<Term>> {
  const rb = new RequestBuilder(rootUrl, syncTerm.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Term>;
    })
  );
}

syncTerm.PATH = '/Term/Sync';
