/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ActionResponseDto } from '../../models/action-response-dto';

export interface RestartServiceDeployer$Params {
}

export function restartServiceDeployer(http: HttpClient, rootUrl: string, params?: RestartServiceDeployer$Params, context?: HttpContext): Observable<StrictHttpResponse<ActionResponseDto>> {
  const rb = new RequestBuilder(rootUrl, restartServiceDeployer.PATH, 'post');
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

restartServiceDeployer.PATH = '/Deployer/restart';
