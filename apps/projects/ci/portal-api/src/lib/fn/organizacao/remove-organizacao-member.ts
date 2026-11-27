/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';


export interface RemoveOrganizacaoMember$Params {
  id: string;
  memberId: string;
}

export function removeOrganizacaoMember(http: HttpClient, rootUrl: string, params: RemoveOrganizacaoMember$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
  const rb = new RequestBuilder(rootUrl, removeOrganizacaoMember.PATH, 'post');
  if (params) {
    rb.path('id', params.id, {});
    rb.path('memberId', params.memberId, {});
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

removeOrganizacaoMember.PATH = '/Organizacao/{id}/Members/{memberId}/Remove';
