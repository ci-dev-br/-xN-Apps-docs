/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { HistoricoContato } from '../../models/historico-contato';
import { SyncPayloadDaoHistoricoContato } from '../../models/sync-payload-dao-historico-contato';

export interface SyncHistoricoContato$Params {
      body: SyncPayloadDaoHistoricoContato
}

export function syncHistoricoContato(http: HttpClient, rootUrl: string, params: SyncHistoricoContato$Params, context?: HttpContext): Observable<StrictHttpResponse<HistoricoContato>> {
  const rb = new RequestBuilder(rootUrl, syncHistoricoContato.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<HistoricoContato>;
    })
  );
}

syncHistoricoContato.PATH = '/HistoricoContato/Sync';
