/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ClienteCrm } from '../../models/cliente-crm';
import { SyncPayloadDaoClienteCrm } from '../../models/sync-payload-dao-cliente-crm';

export interface SyncClienteCrm$Params {
      body: SyncPayloadDaoClienteCrm
}

export function syncClienteCrm(http: HttpClient, rootUrl: string, params: SyncClienteCrm$Params, context?: HttpContext): Observable<StrictHttpResponse<ClienteCrm>> {
  const rb = new RequestBuilder(rootUrl, syncClienteCrm.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<ClienteCrm>;
    })
  );
}

syncClienteCrm.PATH = '/ClienteCrm/Sync';
