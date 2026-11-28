/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { AnotacaoEstudo } from '../../models/anotacao-estudo';
import { SyncPayloadDaoAnotacaoEstudo } from '../../models/sync-payload-dao-anotacao-estudo';

export interface SyncAnotacaoEstudo$Params {
      body: SyncPayloadDaoAnotacaoEstudo
}

export function syncAnotacaoEstudo(http: HttpClient, rootUrl: string, params: SyncAnotacaoEstudo$Params, context?: HttpContext): Observable<StrictHttpResponse<AnotacaoEstudo>> {
  const rb = new RequestBuilder(rootUrl, syncAnotacaoEstudo.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<AnotacaoEstudo>;
    })
  );
}

syncAnotacaoEstudo.PATH = '/AnotacaoEstudo/Sync';
