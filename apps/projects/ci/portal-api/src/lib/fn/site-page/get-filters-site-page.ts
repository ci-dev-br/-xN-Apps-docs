/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { FiltersSitePageOutput } from '../../models/filters-site-page-output';
import { SitePage } from '../../models/site-page';

export interface GetFiltersSitePage$Params {
      body: SitePage
}

export function getFiltersSitePage(http: HttpClient, rootUrl: string, params: GetFiltersSitePage$Params, context?: HttpContext): Observable<StrictHttpResponse<FiltersSitePageOutput>> {
  const rb = new RequestBuilder(rootUrl, getFiltersSitePage.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<FiltersSitePageOutput>;
    })
  );
}

getFiltersSitePage.PATH = '/SitePage/getFilters';
