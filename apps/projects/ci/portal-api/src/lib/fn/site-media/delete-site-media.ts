/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SiteMedia } from '../../models/site-media';

export interface DeleteSiteMedia$Params {
      body: SiteMedia
}

export function deleteSiteMedia(http: HttpClient, rootUrl: string, params: DeleteSiteMedia$Params, context?: HttpContext): Observable<StrictHttpResponse<SiteMedia>> {
  const rb = new RequestBuilder(rootUrl, deleteSiteMedia.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SiteMedia>;
    })
  );
}

deleteSiteMedia.PATH = '/SiteMedia/Delete';
