/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { CreateLogDto } from '../../models/create-log-dto';
import { Log } from '../../models/log';

export interface RegistryLog$Params {
      body: CreateLogDto
}

export function registryLog(http: HttpClient, rootUrl: string, params: RegistryLog$Params, context?: HttpContext): Observable<StrictHttpResponse<Log>> {
  const rb = new RequestBuilder(rootUrl, registryLog.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
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

registryLog.PATH = '/Logger/Registry';
