/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { Domain } from '../../models/domain';
import { GetInputDtos } from '../../models/get-input-dtos';

export interface GetDomain$Params {
      body: GetInputDtos
}

export function getDomain(http: HttpClient, rootUrl: string, params: GetDomain$Params, context?: HttpContext): Observable<StrictHttpResponse<Domain>> {
  const rb = new RequestBuilder(rootUrl, getDomain.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Domain>;
    })
  );
}

getDomain.PATH = '/Domain/Get';
