/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { Form } from '../../models/form';
import { GetByInternalIdInputDto } from '../../models/get-by-internal-id-input-dto';

export interface FormsGetByInternalId$Params {
      body: GetByInternalIdInputDto
}

export function formsGetByInternalId(http: HttpClient, rootUrl: string, params: FormsGetByInternalId$Params, context?: HttpContext): Observable<StrictHttpResponse<Form>> {
  const rb = new RequestBuilder(rootUrl, formsGetByInternalId.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Form>;
    })
  );
}

formsGetByInternalId.PATH = '/Forms/GetByInternalId';
