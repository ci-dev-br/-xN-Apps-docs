/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { DocumentoIdentificacao } from '../../models/documento-identificacao';
import { GetByInternalIdInputDto } from '../../models/get-by-internal-id-input-dto';

export interface GetByInternalIdDocumentoIdentificacao$Params {
      body: GetByInternalIdInputDto
}

export function getByInternalIdDocumentoIdentificacao(http: HttpClient, rootUrl: string, params: GetByInternalIdDocumentoIdentificacao$Params, context?: HttpContext): Observable<StrictHttpResponse<DocumentoIdentificacao>> {
  const rb = new RequestBuilder(rootUrl, getByInternalIdDocumentoIdentificacao.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<DocumentoIdentificacao>;
    })
  );
}

getByInternalIdDocumentoIdentificacao.PATH = '/DocumentoIdentificacao/GetByInternalId';
