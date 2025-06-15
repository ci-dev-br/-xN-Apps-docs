/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { Forms } from '../../models/forms';
import { GetByInternalIdInputDto } from '../../models/get-by-internal-id-input-dto';

export interface GetByInternalIdForms$Params {
      body: GetByInternalIdInputDto
}

export function getByInternalIdForms(http: HttpClient, rootUrl: string, params: GetByInternalIdForms$Params, context?: HttpContext): Observable<StrictHttpResponse<Forms>> {
  const rb = new RequestBuilder(rootUrl, getByInternalIdForms.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Forms>;
    })
  );
}

getByInternalIdForms.PATH = '/Forms/GetByInternalId';
