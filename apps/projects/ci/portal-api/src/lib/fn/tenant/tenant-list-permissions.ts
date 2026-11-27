/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { TenantPermission } from '../../models/tenant-permission';

export interface TenantListPermissions$Params {
  id: string;
}

export function tenantListPermissions(http: HttpClient, rootUrl: string, params: TenantListPermissions$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<TenantPermission>>> {
  const rb = new RequestBuilder(rootUrl, tenantListPermissions.PATH, 'get');
  if (params) {
    rb.path('id', params.id, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<TenantPermission>>;
    })
  );
}

tenantListPermissions.PATH = '/Tenant/{id}/Permissions';
