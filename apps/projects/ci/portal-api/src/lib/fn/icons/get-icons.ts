/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { Icon } from '../../models/icon';
import { IconGetInput } from '../../models/icon-get-input';

export interface GetIcons$Params {
      body: IconGetInput
}

export function getIcons(http: HttpClient, rootUrl: string, params: GetIcons$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<Icon>>> {
  const rb = new RequestBuilder(rootUrl, getIcons.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<Icon>>;
    })
  );
}

getIcons.PATH = '/Icons/Get';
