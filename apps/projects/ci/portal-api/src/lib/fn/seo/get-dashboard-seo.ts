/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { DashboardSeoDto } from '../../models/dashboard-seo-dto';
import { ObterDashboardSeoDto } from '../../models/obter-dashboard-seo-dto';

export interface GetDashboardSeo$Params {
      body: ObterDashboardSeoDto
}

export function getDashboardSeo(http: HttpClient, rootUrl: string, params: GetDashboardSeo$Params, context?: HttpContext): Observable<StrictHttpResponse<DashboardSeoDto>> {
  const rb = new RequestBuilder(rootUrl, getDashboardSeo.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<DashboardSeoDto>;
    })
  );
}

getDashboardSeo.PATH = '/Seo/GetDashboard';
