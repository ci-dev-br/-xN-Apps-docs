/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { DevicePayload } from '../../models/device-payload';
import { PoolDto } from '../../models/pool-dto';

export interface DevicePool$Params {
      body: DevicePayload
}

export function devicePool(http: HttpClient, rootUrl: string, params: DevicePool$Params, context?: HttpContext): Observable<StrictHttpResponse<PoolDto>> {
  const rb = new RequestBuilder(rootUrl, devicePool.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<PoolDto>;
    })
  );
}

devicePool.PATH = '/Device/Pool';
