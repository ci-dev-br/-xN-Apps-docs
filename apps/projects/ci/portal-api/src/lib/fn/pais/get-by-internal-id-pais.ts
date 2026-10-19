/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { GetByInternalIdInputDto } from '../../models/get-by-internal-id-input-dto';
import { Pais } from '../../models/pais';

export interface GetByInternalIdPais$Params {
      body: GetByInternalIdInputDto
}

export function getByInternalIdPais(http: HttpClient, rootUrl: string, params: GetByInternalIdPais$Params, context?: HttpContext): Observable<StrictHttpResponse<Pais>> {
  const rb = new RequestBuilder(rootUrl, getByInternalIdPais.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Pais>;
    })
  );
}

getByInternalIdPais.PATH = '/Pais/GetByInternalId';
