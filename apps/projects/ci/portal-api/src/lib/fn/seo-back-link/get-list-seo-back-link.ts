/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ObterListaSeoBackLink } from '../../models/obter-lista-seo-back-link';
import { SeoBackLink } from '../../models/seo-back-link';

export interface GetListSeoBackLink$Params {
      body: ObterListaSeoBackLink
}

export function getListSeoBackLink(http: HttpClient, rootUrl: string, params: GetListSeoBackLink$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<SeoBackLink>>> {
  const rb = new RequestBuilder(rootUrl, getListSeoBackLink.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<SeoBackLink>>;
    })
  );
}

getListSeoBackLink.PATH = '/SeoBackLink/GetList';
