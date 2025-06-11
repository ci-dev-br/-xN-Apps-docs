/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { Promocao } from '../../models/promocao';
import { SyncPayloadDaoPromocao } from '../../models/sync-payload-dao-promocao';

export interface SyncPromocao$Params {
      body: SyncPayloadDaoPromocao
}

export function syncPromocao(http: HttpClient, rootUrl: string, params: SyncPromocao$Params, context?: HttpContext): Observable<StrictHttpResponse<Promocao>> {
  const rb = new RequestBuilder(rootUrl, syncPromocao.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Promocao>;
    })
  );
}

syncPromocao.PATH = '/Promocao/Sync';
