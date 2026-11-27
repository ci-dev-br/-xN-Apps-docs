/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { Oportunidade } from '../../models/oportunidade';
import { SyncPayloadDaoOportunidade } from '../../models/sync-payload-dao-oportunidade';

export interface SyncOportunidade$Params {
      body: SyncPayloadDaoOportunidade
}

export function syncOportunidade(http: HttpClient, rootUrl: string, params: SyncOportunidade$Params, context?: HttpContext): Observable<StrictHttpResponse<Oportunidade>> {
  const rb = new RequestBuilder(rootUrl, syncOportunidade.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Oportunidade>;
    })
  );
}

syncOportunidade.PATH = '/Oportunidade/Sync';
