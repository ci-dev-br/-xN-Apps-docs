/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { Servico } from '../../models/servico';
import { SyncPayloadDaoServico } from '../../models/sync-payload-dao-servico';

export interface SyncServico$Params {
      body: SyncPayloadDaoServico
}

export function syncServico(http: HttpClient, rootUrl: string, params: SyncServico$Params, context?: HttpContext): Observable<StrictHttpResponse<Servico>> {
  const rb = new RequestBuilder(rootUrl, syncServico.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Servico>;
    })
  );
}

syncServico.PATH = '/Servico/Sync';
