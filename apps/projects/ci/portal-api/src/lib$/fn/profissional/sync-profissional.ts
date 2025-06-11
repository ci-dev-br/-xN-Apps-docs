/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { Profissional } from '../../models/profissional';
import { SyncPayloadDaoProfissional } from '../../models/sync-payload-dao-profissional';

export interface SyncProfissional$Params {
      body: SyncPayloadDaoProfissional
}

export function syncProfissional(http: HttpClient, rootUrl: string, params: SyncProfissional$Params, context?: HttpContext): Observable<StrictHttpResponse<Profissional>> {
  const rb = new RequestBuilder(rootUrl, syncProfissional.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Profissional>;
    })
  );
}

syncProfissional.PATH = '/Profissional/Sync';
