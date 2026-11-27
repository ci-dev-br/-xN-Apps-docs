/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { CampanhaMarketing } from '../../models/campanha-marketing';
import { SyncPayloadDaoCampanhaMarketing } from '../../models/sync-payload-dao-campanha-marketing';

export interface SyncCampanhaMarketing$Params {
      body: SyncPayloadDaoCampanhaMarketing
}

export function syncCampanhaMarketing(http: HttpClient, rootUrl: string, params: SyncCampanhaMarketing$Params, context?: HttpContext): Observable<StrictHttpResponse<CampanhaMarketing>> {
  const rb = new RequestBuilder(rootUrl, syncCampanhaMarketing.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<CampanhaMarketing>;
    })
  );
}

syncCampanhaMarketing.PATH = '/CampanhaMarketing/Sync';
