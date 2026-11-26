/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { GrupoTopico } from '../../models/grupo-topico';

export interface TenantCreateTopic$Params {
  id: string;
}

export function tenantCreateTopic(http: HttpClient, rootUrl: string, params: TenantCreateTopic$Params, context?: HttpContext): Observable<StrictHttpResponse<GrupoTopico>> {
  const rb = new RequestBuilder(rootUrl, tenantCreateTopic.PATH, 'post');
  if (params) {
    rb.path('id', params.id, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<GrupoTopico>;
    })
  );
}

tenantCreateTopic.PATH = '/Tenant/Groups/{id}/Topics';
