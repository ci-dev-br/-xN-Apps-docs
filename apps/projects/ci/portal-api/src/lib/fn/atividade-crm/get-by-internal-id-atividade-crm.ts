/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { AtividadeCrm } from '../../models/atividade-crm';
import { GetByInternalIdInputDto } from '../../models/get-by-internal-id-input-dto';

export interface GetByInternalIdAtividadeCrm$Params {
      body: GetByInternalIdInputDto
}

export function getByInternalIdAtividadeCrm(http: HttpClient, rootUrl: string, params: GetByInternalIdAtividadeCrm$Params, context?: HttpContext): Observable<StrictHttpResponse<AtividadeCrm>> {
  const rb = new RequestBuilder(rootUrl, getByInternalIdAtividadeCrm.PATH, 'post');
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

getByInternalIdAtividadeCrm.PATH = '/AtividadeCrm/GetByInternalId';
