/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ObterListaSiteMedia } from '../../models/obter-lista-site-media';
import { SiteMedia } from '../../models/site-media';

export interface GetListSiteMedia$Params {
      body: ObterListaSiteMedia
}

export function getListSiteMedia(http: HttpClient, rootUrl: string, params: GetListSiteMedia$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<SiteMedia>>> {
  const rb = new RequestBuilder(rootUrl, getListSiteMedia.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<SiteMedia>>;
    })
  );
}

getListSiteMedia.PATH = '/SiteMedia/GetList';
