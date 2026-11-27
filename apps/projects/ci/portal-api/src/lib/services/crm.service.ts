/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { DashboardCrmDto } from '../models/dashboard-crm-dto';
import { getDashboardCrm } from '../fn/crm/get-dashboard-crm';
import { GetDashboardCrm$Params } from '../fn/crm/get-dashboard-crm';

@Injectable()
export class CrmService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `getDashboardCrm()` */
  static readonly GetDashboardCrmPath = '/Crm/GetDashboard';

  /**
   * Obtém a visão geral consolidada do dashboard CRM (KPIs, funil de oportunidades, etapas, atividades e contadores).
   *
   *
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getDashboardCrm()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getDashboardCrm$Response(params: GetDashboardCrm$Params, context?: HttpContext): Observable<StrictHttpResponse<DashboardCrmDto>> {
    return getDashboardCrm(this.http, this.rootUrl, params, context);
  }

  /**
   * Obtém a visão geral consolidada do dashboard CRM (KPIs, funil de oportunidades, etapas, atividades e contadores).
   *
   *
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getDashboardCrm$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getDashboard(params: GetDashboardCrm$Params, context?: HttpContext): Observable<DashboardCrmDto> {
    return this.getDashboardCrm$Response(params, context).pipe(
      map((r: StrictHttpResponse<DashboardCrmDto>): DashboardCrmDto => r.body)
    );
  }

}
