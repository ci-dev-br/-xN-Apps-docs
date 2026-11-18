/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { AuthorizationOutput } from '../../models/authorization-output';
import { RefreshPayloadInputDto } from '../../models/refresh-payload-input-dto';

export interface RefreshAuth$Params {
      body: RefreshPayloadInputDto
}

export function refreshAuth(http: HttpClient, rootUrl: string, params: RefreshAuth$Params, context?: HttpContext): Observable<StrictHttpResponse<AuthorizationOutput>> {
  const rb = new RequestBuilder(rootUrl, refreshAuth.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<AuthorizationOutput>;
    })
  );
}

refreshAuth.PATH = '/auth/Refresh';
