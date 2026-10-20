/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ObterListaTipoDocumentoIdentificacao } from '../../models/obter-lista-tipo-documento-identificacao';
import { SyncPayloadDaoTipoDocumentoIdentificacao } from '../../models/sync-payload-dao-tipo-documento-identificacao';

export interface GetListTipoDocumentoIdentificacao$Params {
      body: ObterListaTipoDocumentoIdentificacao
}

export function getListTipoDocumentoIdentificacao(http: HttpClient, rootUrl: string, params: GetListTipoDocumentoIdentificacao$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDaoTipoDocumentoIdentificacao>> {
  const rb = new RequestBuilder(rootUrl, getListTipoDocumentoIdentificacao.PATH, 'post');
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

getListTipoDocumentoIdentificacao.PATH = '/TipoDocumentoIdentificacao/GetList';
