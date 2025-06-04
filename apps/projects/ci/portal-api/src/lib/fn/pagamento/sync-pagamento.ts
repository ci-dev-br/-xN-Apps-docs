/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { Pagamento } from '../../models/pagamento';
import { SyncPayloadDaoPagamento } from '../../models/sync-payload-dao-pagamento';

export interface SyncPagamento$Params {
      body: SyncPayloadDaoPagamento
}

export function syncPagamento(http: HttpClient, rootUrl: string, params: SyncPagamento$Params, context?: HttpContext): Observable<StrictHttpResponse<Pagamento>> {
  const rb = new RequestBuilder(rootUrl, syncPagamento.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Pagamento>;
    })
  );
}

syncPagamento.PATH = '/Pagamento/Sync';
