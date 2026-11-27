/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { TenantPermission } from '../../models/tenant-permission';

export interface TenantUpsertPermission$Params {
  id: string;
}

export function tenantUpsertPermission(http: HttpClient, rootUrl: string, params: TenantUpsertPermission$Params, context?: HttpContext): Observable<StrictHttpResponse<TenantPermission>> {
  const rb = new RequestBuilder(rootUrl, tenantUpsertPermission.PATH, 'post');
  if (params) {
    rb.path('id', params.id, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<TenantPermission>;
    })
  );
}

tenantUpsertPermission.PATH = '/Tenant/{id}/Permissions';
