/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { DashboardCrmDto } from '../../models/dashboard-crm-dto';
import { ObterDashboardCrmDto } from '../../models/obter-dashboard-crm-dto';

export interface GetDashboardCrm$Params {
      body: ObterDashboardCrmDto
}

export function getDashboardCrm(http: HttpClient, rootUrl: string, params: GetDashboardCrm$Params, context?: HttpContext): Observable<StrictHttpResponse<DashboardCrmDto>> {
  const rb = new RequestBuilder(rootUrl, getDashboardCrm.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<DashboardCrmDto>;
    })
  );
}

getDashboardCrm.PATH = '/Crm/GetDashboard';
