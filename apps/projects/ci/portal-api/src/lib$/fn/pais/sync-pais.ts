/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { Pais } from '../../models/pais';
import { SyncPayloadDaoPais } from '../../models/sync-payload-dao-pais';

export interface SyncPais$Params {
      body: SyncPayloadDaoPais
}

export function syncPais(http: HttpClient, rootUrl: string, params: SyncPais$Params, context?: HttpContext): Observable<StrictHttpResponse<Pais>> {
  const rb = new RequestBuilder(rootUrl, syncPais.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Pais>;
    })
  );
}

syncPais.PATH = '/Pais/Sync';
