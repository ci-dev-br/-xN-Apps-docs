/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SyncPayloadDaoProduto } from '../../models/sync-payload-dao-produto';

export interface SyncProduto$Params {
      body: SyncPayloadDaoProduto
}

export function syncProduto(http: HttpClient, rootUrl: string, params: SyncProduto$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDaoProduto>> {
  const rb = new RequestBuilder(rootUrl, syncProduto.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SyncPayloadDaoProduto>;
    })
  );
}

syncProduto.PATH = '/Produto/Sync';
