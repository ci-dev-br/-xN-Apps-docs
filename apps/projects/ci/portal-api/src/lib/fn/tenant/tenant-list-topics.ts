/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { GrupoTopico } from '../../models/grupo-topico';

export interface TenantListTopics$Params {
  id: string;
}

export function tenantListTopics(http: HttpClient, rootUrl: string, params: TenantListTopics$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<GrupoTopico>>> {
  const rb = new RequestBuilder(rootUrl, tenantListTopics.PATH, 'get');
  if (params) {
    rb.path('id', params.id, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<GrupoTopico>>;
    })
  );
}

tenantListTopics.PATH = '/Tenant/Groups/{id}/Topics';
