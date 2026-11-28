/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { Instrutor } from '../../models/instrutor';
import { SyncPayloadDaoInstrutor } from '../../models/sync-payload-dao-instrutor';

export interface SyncInstrutor$Params {
      body: SyncPayloadDaoInstrutor
}

export function syncInstrutor(http: HttpClient, rootUrl: string, params: SyncInstrutor$Params, context?: HttpContext): Observable<StrictHttpResponse<Instrutor>> {
  const rb = new RequestBuilder(rootUrl, syncInstrutor.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Instrutor>;
    })
  );
}

syncInstrutor.PATH = '/Instrutor/Sync';
