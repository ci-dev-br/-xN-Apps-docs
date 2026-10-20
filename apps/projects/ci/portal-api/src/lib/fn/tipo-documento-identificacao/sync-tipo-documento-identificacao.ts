/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SyncPayloadDaoTipoDocumentoIdentificacao } from '../../models/sync-payload-dao-tipo-documento-identificacao';

export interface SyncTipoDocumentoIdentificacao$Params {
      body: SyncPayloadDaoTipoDocumentoIdentificacao
}

export function syncTipoDocumentoIdentificacao(http: HttpClient, rootUrl: string, params: SyncTipoDocumentoIdentificacao$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDaoTipoDocumentoIdentificacao>> {
  const rb = new RequestBuilder(rootUrl, syncTipoDocumentoIdentificacao.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SyncPayloadDaoTipoDocumentoIdentificacao>;
    })
  );
}

syncTipoDocumentoIdentificacao.PATH = '/TipoDocumentoIdentificacao/Sync';
