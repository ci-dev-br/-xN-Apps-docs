/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';


export interface TenantDeletePermission$Params {
  id: string;
  permissionId: string;
}

export function tenantDeletePermission(http: HttpClient, rootUrl: string, params: TenantDeletePermission$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
  const rb = new RequestBuilder(rootUrl, tenantDeletePermission.PATH, 'post');
  if (params) {
    rb.path('id', params.id, {});
    rb.path('permissionId', params.permissionId, {});
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

tenantDeletePermission.PATH = '/Tenant/{id}/Permissions/{permissionId}/Delete';
