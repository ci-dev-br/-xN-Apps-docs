/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SeoCampanha } from '../../models/seo-campanha';
import { SyncPayloadDaoSeoCampanha } from '../../models/sync-payload-dao-seo-campanha';

export interface SyncSeoCampanha$Params {
      body: SyncPayloadDaoSeoCampanha
}

export function syncSeoCampanha(http: HttpClient, rootUrl: string, params: SyncSeoCampanha$Params, context?: HttpContext): Observable<StrictHttpResponse<SeoCampanha>> {
  const rb = new RequestBuilder(rootUrl, syncSeoCampanha.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SeoCampanha>;
    })
  );
}

syncSeoCampanha.PATH = '/SeoCampanha/Sync';
