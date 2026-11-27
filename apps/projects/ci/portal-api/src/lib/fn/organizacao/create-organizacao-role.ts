/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { CriarOrganizacaoRoleDto } from '../../models/criar-organizacao-role-dto';

export interface CreateOrganizacaoRole$Params {
  id: string;
      body: CriarOrganizacaoRoleDto
}

export function createOrganizacaoRole(http: HttpClient, rootUrl: string, params: CreateOrganizacaoRole$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
  const rb = new RequestBuilder(rootUrl, createOrganizacaoRole.PATH, 'post');
  if (params) {
    rb.path('id', params.id, {});
    rb.body(params.body, 'application/json');
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

createOrganizacaoRole.PATH = '/Organizacao/{id}/Roles';
