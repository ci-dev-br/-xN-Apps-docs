/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { AtividadeCrm } from '../../models/atividade-crm';
import { SyncPayloadDaoAtividadeCrm } from '../../models/sync-payload-dao-atividade-crm';

export interface SyncAtividadeCrm$Params {
      body: SyncPayloadDaoAtividadeCrm
}

export function syncAtividadeCrm(http: HttpClient, rootUrl: string, params: SyncAtividadeCrm$Params, context?: HttpContext): Observable<StrictHttpResponse<AtividadeCrm>> {
  const rb = new RequestBuilder(rootUrl, syncAtividadeCrm.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<AtividadeCrm>;
    })
  );
}

syncAtividadeCrm.PATH = '/AtividadeCrm/Sync';
