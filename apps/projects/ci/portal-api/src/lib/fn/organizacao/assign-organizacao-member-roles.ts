/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { AtribuirRolesMembroDto } from '../../models/atribuir-roles-membro-dto';

export interface AssignOrganizacaoMemberRoles$Params {
  id: string;
  memberId: string;
      body: AtribuirRolesMembroDto
}

export function assignOrganizacaoMemberRoles(http: HttpClient, rootUrl: string, params: AssignOrganizacaoMemberRoles$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
  const rb = new RequestBuilder(rootUrl, assignOrganizacaoMemberRoles.PATH, 'post');
  if (params) {
    rb.path('id', params.id, {});
    rb.path('memberId', params.memberId, {});
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

assignOrganizacaoMemberRoles.PATH = '/Organizacao/{id}/Members/{memberId}/Roles';
