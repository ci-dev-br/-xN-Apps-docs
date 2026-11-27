/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SeoBackLink } from '../../models/seo-back-link';

export interface DeleteSeoBackLink$Params {
      body: SeoBackLink
}

export function deleteSeoBackLink(http: HttpClient, rootUrl: string, params: DeleteSeoBackLink$Params, context?: HttpContext): Observable<StrictHttpResponse<SeoBackLink>> {
  const rb = new RequestBuilder(rootUrl, deleteSeoBackLink.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SeoBackLink>;
    })
  );
}

deleteSeoBackLink.PATH = '/SeoBackLink/Delete';
