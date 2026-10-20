/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { Log } from '../../models/log';

export interface GetLogById$Params {
  id: string;
}

export function getLogById(http: HttpClient, rootUrl: string, params: GetLogById$Params, context?: HttpContext): Observable<StrictHttpResponse<Log>> {
  const rb = new RequestBuilder(rootUrl, getLogById.PATH, 'get');
  if (params) {
    rb.path('id', params.id, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Log>;
    })
  );
}

getLogById.PATH = '/Logger/{id}';
