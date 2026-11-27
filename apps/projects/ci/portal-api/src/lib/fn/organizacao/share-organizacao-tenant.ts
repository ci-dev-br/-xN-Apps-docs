/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { CompartilharOrganizacaoDto } from '../../models/compartilhar-organizacao-dto';

export interface ShareOrganizacaoTenant$Params {
  id: string;
      body: CompartilharOrganizacaoDto
}

export function shareOrganizacaoTenant(http: HttpClient, rootUrl: string, params: ShareOrganizacaoTenant$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
  const rb = new RequestBuilder(rootUrl, shareOrganizacaoTenant.PATH, 'post');
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

shareOrganizacaoTenant.PATH = '/Organizacao/{id}/Share';
