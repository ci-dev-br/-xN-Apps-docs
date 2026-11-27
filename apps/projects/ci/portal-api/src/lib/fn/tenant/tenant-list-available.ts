/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { Tenant } from '../../models/tenant';

export interface TenantListAvailable$Params {
  organizacaoId?: string;
}

export function tenantListAvailable(http: HttpClient, rootUrl: string, params?: TenantListAvailable$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<Tenant>>> {
  const rb = new RequestBuilder(rootUrl, tenantListAvailable.PATH, 'get');
  if (params) {
    rb.query('organizacaoId', params.organizacaoId, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<Tenant>>;
    })
  );
}

tenantListAvailable.PATH = '/Tenant/Available';
