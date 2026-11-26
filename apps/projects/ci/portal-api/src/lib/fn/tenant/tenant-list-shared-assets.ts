/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { GrupoAtivoCompartilhado } from '../../models/grupo-ativo-compartilhado';

export interface TenantListSharedAssets$Params {
  id: string;
}

export function tenantListSharedAssets(http: HttpClient, rootUrl: string, params: TenantListSharedAssets$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<GrupoAtivoCompartilhado>>> {
  const rb = new RequestBuilder(rootUrl, tenantListSharedAssets.PATH, 'get');
  if (params) {
    rb.path('id', params.id, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<GrupoAtivoCompartilhado>>;
    })
  );
}

tenantListSharedAssets.PATH = '/Tenant/Groups/{id}/SharedAssets';
