/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ObterListaSeoPage } from '../../models/obter-lista-seo-page';
import { SeoPage } from '../../models/seo-page';

export interface GetListSeoPage$Params {
      body: ObterListaSeoPage
}

export function getListSeoPage(http: HttpClient, rootUrl: string, params: GetListSeoPage$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<SeoPage>>> {
  const rb = new RequestBuilder(rootUrl, getListSeoPage.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<SeoPage>>;
    })
  );
}

getListSeoPage.PATH = '/SeoPage/GetList';
