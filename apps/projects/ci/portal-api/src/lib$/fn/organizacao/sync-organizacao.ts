/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SyncPayloadDaoOrganizacao } from '../../models/sync-payload-dao-organizacao';

export interface SyncOrganizacao$Params {
      body: SyncPayloadDaoOrganizacao
}

export function syncOrganizacao(http: HttpClient, rootUrl: string, params: SyncOrganizacao$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDaoOrganizacao>> {
  const rb = new RequestBuilder(rootUrl, syncOrganizacao.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SyncPayloadDaoOrganizacao>;
    })
  );
}

syncOrganizacao.PATH = '/Organizacao/Sync';
