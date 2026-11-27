/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ActionResponseDto } from '../../models/action-response-dto';

export interface ClearCacheDeployer$Params {
}

export function clearCacheDeployer(http: HttpClient, rootUrl: string, params?: ClearCacheDeployer$Params, context?: HttpContext): Observable<StrictHttpResponse<ActionResponseDto>> {
  const rb = new RequestBuilder(rootUrl, clearCacheDeployer.PATH, 'post');
  if (params) {
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<ActionResponseDto>;
    })
  );
}

clearCacheDeployer.PATH = '/Deployer/cache/clear';
