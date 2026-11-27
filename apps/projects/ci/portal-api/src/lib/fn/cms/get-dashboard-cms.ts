/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { DashboardCmsDto } from '../../models/dashboard-cms-dto';
import { ObterDashboardCmsDto } from '../../models/obter-dashboard-cms-dto';

export interface GetDashboardCms$Params {
      body: ObterDashboardCmsDto
}

export function getDashboardCms(http: HttpClient, rootUrl: string, params: GetDashboardCms$Params, context?: HttpContext): Observable<StrictHttpResponse<DashboardCmsDto>> {
  const rb = new RequestBuilder(rootUrl, getDashboardCms.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<DashboardCmsDto>;
    })
  );
}

getDashboardCms.PATH = '/Cms/GetDashboard';
