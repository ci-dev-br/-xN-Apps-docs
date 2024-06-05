/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { Tenant } from '../../models/tenant';

export interface OrganizacaoGetCurrent$Params {
}

export function organizacaoGetCurrent(http: HttpClient, rootUrl: string, params?: OrganizacaoGetCurrent$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<Tenant>>> {
  const rb = new RequestBuilder(rootUrl, organizacaoGetCurrent.PATH, 'post');
  if (params) {
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<Tenant>>;
    })
  );
}

organizacaoGetCurrent.PATH = '/Organizacao/GetCurrent';
