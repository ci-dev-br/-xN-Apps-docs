/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { DashboardCmsDto } from '../models/dashboard-cms-dto';
import { getDashboardCms } from '../fn/cms/get-dashboard-cms';
import { GetDashboardCms$Params } from '../fn/cms/get-dashboard-cms';

@Injectable()
export class CmsService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `getDashboardCms()` */
  static readonly GetDashboardCmsPath = '/Cms/GetDashboard';

  /**
   * Obtém a visão geral consolidada do dashboard CMS (KPIs, conteúdos, páginas, mídias, websites, comentários e termos).
   *
   *
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getDashboardCms()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getDashboardCms$Response(params: GetDashboardCms$Params, context?: HttpContext): Observable<StrictHttpResponse<DashboardCmsDto>> {
    return getDashboardCms(this.http, this.rootUrl, params, context);
  }

  /**
   * Obtém a visão geral consolidada do dashboard CMS (KPIs, conteúdos, páginas, mídias, websites, comentários e termos).
   *
   *
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getDashboardCms$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getDashboard(params: GetDashboardCms$Params, context?: HttpContext): Observable<DashboardCmsDto> {
    return this.getDashboardCms$Response(params, context).pipe(
      map((r: StrictHttpResponse<DashboardCmsDto>): DashboardCmsDto => r.body)
    );
  }

}
