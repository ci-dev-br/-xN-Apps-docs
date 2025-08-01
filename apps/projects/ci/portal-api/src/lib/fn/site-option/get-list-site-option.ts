/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ObterListaSiteOption } from '../../models/obter-lista-site-option';
import { SiteOption } from '../../models/site-option';

export interface GetListSiteOption$Params {
      body: ObterListaSiteOption
}

export function getListSiteOption(http: HttpClient, rootUrl: string, params: GetListSiteOption$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<SiteOption>>> {
  const rb = new RequestBuilder(rootUrl, getListSiteOption.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<SiteOption>>;
    })
  );
}

getListSiteOption.PATH = '/SiteOption/GetList';
