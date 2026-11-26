/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SyncPayloadDaoClienteProjeto } from '../../models/sync-payload-dao-cliente-projeto';

export interface SyncClienteProjeto$Params {
      body: SyncPayloadDaoClienteProjeto
}

export function syncClienteProjeto(http: HttpClient, rootUrl: string, params: SyncClienteProjeto$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDaoClienteProjeto>> {
  const rb = new RequestBuilder(rootUrl, syncClienteProjeto.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SyncPayloadDaoClienteProjeto>;
    })
  );
}

syncClienteProjeto.PATH = '/ClienteProjeto/Sync';
