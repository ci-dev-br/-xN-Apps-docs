/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { DevicePayload } from '../../models/device-payload';

export interface Connect$Params {
}

export function connect(http: HttpClient, rootUrl: string, params?: Connect$Params, context?: HttpContext): Observable<StrictHttpResponse<DevicePayload>> {
  const rb = new RequestBuilder(rootUrl, connect.PATH, 'post');
  if (params) {
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<DevicePayload>;
    })
  );
}

connect.PATH = '/Device/Connect';
