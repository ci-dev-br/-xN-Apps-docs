/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SeoKeyWord } from '../../models/seo-key-word';

export interface DeleteSeoKeyWord$Params {
      body: SeoKeyWord
}

export function deleteSeoKeyWord(http: HttpClient, rootUrl: string, params: DeleteSeoKeyWord$Params, context?: HttpContext): Observable<StrictHttpResponse<SeoKeyWord>> {
  const rb = new RequestBuilder(rootUrl, deleteSeoKeyWord.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SeoKeyWord>;
    })
  );
}

deleteSeoKeyWord.PATH = '/SeoKeyWord/Delete';
