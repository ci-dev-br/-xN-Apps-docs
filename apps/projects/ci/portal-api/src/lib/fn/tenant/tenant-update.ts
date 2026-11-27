/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { Tenant } from '../../models/tenant';

export interface TenantUpdate$Params {
  id: string;
}

export function tenantUpdate(http: HttpClient, rootUrl: string, params: TenantUpdate$Params, context?: HttpContext): Observable<StrictHttpResponse<Tenant>> {
  const rb = new RequestBuilder(rootUrl, tenantUpdate.PATH, 'post');
  if (params) {
    rb.path('id', params.id, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Tenant>;
    })
  );
}

tenantUpdate.PATH = '/Tenant/{id}/Update';
