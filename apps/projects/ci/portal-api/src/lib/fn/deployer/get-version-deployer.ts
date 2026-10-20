/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { AvailableVersionInfoDto } from '../../models/available-version-info-dto';

export interface GetVersionDeployer$Params {
}

export function getVersionDeployer(http: HttpClient, rootUrl: string, params?: GetVersionDeployer$Params, context?: HttpContext): Observable<StrictHttpResponse<AvailableVersionInfoDto>> {
  const rb = new RequestBuilder(rootUrl, getVersionDeployer.PATH, 'post');
  if (params) {
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<AvailableVersionInfoDto>;
    })
  );
}

getVersionDeployer.PATH = '/Deployer/version';
