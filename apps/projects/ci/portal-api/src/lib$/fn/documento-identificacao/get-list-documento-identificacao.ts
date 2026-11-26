/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ObterListaDocumentoIdentificacao } from '../../models/obter-lista-documento-identificacao';
import { SyncPayloadDaoDocumentoIdentificacao } from '../../models/sync-payload-dao-documento-identificacao';

export interface GetListDocumentoIdentificacao$Params {
      body: ObterListaDocumentoIdentificacao
}

export function getListDocumentoIdentificacao(http: HttpClient, rootUrl: string, params: GetListDocumentoIdentificacao$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDaoDocumentoIdentificacao>> {
  const rb = new RequestBuilder(rootUrl, getListDocumentoIdentificacao.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SyncPayloadDaoDocumentoIdentificacao>;
    })
  );
}

getListDocumentoIdentificacao.PATH = '/DocumentoIdentificacao/GetList';
