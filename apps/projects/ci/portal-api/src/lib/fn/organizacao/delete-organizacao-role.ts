/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';


export interface DeleteOrganizacaoRole$Params {
  id: string;
  roleId: string;
}

export function deleteOrganizacaoRole(http: HttpClient, rootUrl: string, params: DeleteOrganizacaoRole$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
  const rb = new RequestBuilder(rootUrl, deleteOrganizacaoRole.PATH, 'post');
  if (params) {
    rb.path('id', params.id, {});
    rb.path('roleId', params.roleId, {});
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

deleteOrganizacaoRole.PATH = '/Organizacao/{id}/Roles/{roleId}/Delete';
