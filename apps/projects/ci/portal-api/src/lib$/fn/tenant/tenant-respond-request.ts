/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';


export interface TenantRespondRequest$Params {
  id: string;
  requestId: string;
}

export function tenantRespondRequest(http: HttpClient, rootUrl: string, params: TenantRespondRequest$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
  const rb = new RequestBuilder(rootUrl, tenantRespondRequest.PATH, 'post');
  if (params) {
    rb.path('id', params.id, {});
    rb.path('requestId', params.requestId, {});
  }

  return http.request(
    rb.build({ responseType: 'text', accept: '*/*', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return (r as HttpResponse<any>).clone({ body: undefined }) as StrictHttpResponse<void>;
    })
  );
}

tenantRespondRequest.PATH = '/Tenant/Groups/{id}/Requests/{requestId}/Respond';
