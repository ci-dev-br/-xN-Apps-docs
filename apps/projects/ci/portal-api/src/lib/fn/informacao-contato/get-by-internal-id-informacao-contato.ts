/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { GetByInternalIdInputDto } from '../../models/get-by-internal-id-input-dto';
import { InformacaoContato } from '../../models/informacao-contato';

export interface GetByInternalIdInformacaoContato$Params {
      body: GetByInternalIdInputDto
}

export function getByInternalIdInformacaoContato(http: HttpClient, rootUrl: string, params: GetByInternalIdInformacaoContato$Params, context?: HttpContext): Observable<StrictHttpResponse<InformacaoContato>> {
  const rb = new RequestBuilder(rootUrl, getByInternalIdInformacaoContato.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<InformacaoContato>;
    })
  );
}

getByInternalIdInformacaoContato.PATH = '/InformacaoContato/GetByInternalId';
