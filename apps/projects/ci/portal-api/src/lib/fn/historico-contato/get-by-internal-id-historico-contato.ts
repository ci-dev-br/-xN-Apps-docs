/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { GetByInternalIdInputDto } from '../../models/get-by-internal-id-input-dto';
import { HistoricoContato } from '../../models/historico-contato';

export interface GetByInternalIdHistoricoContato$Params {
      body: GetByInternalIdInputDto
}

export function getByInternalIdHistoricoContato(http: HttpClient, rootUrl: string, params: GetByInternalIdHistoricoContato$Params, context?: HttpContext): Observable<StrictHttpResponse<HistoricoContato>> {
  const rb = new RequestBuilder(rootUrl, getByInternalIdHistoricoContato.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<HistoricoContato>;
    })
  );
}

getByInternalIdHistoricoContato.PATH = '/HistoricoContato/GetByInternalId';
