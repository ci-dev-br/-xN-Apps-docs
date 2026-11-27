/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { News } from '../../models/news';

export interface GetCorrelatedNewsById$Params {
  newsId: string;
  phrase?: string;
  limit?: number;
}

export function getCorrelatedNewsById(http: HttpClient, rootUrl: string, params: GetCorrelatedNewsById$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<News>>> {
  const rb = new RequestBuilder(rootUrl, getCorrelatedNewsById.PATH, 'get');
  if (params) {
    rb.path('newsId', params.newsId, {});
    rb.query('phrase', params.phrase, {});
    rb.query('limit', params.limit, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<News>>;
    })
  );
}

getCorrelatedNewsById.PATH = '/News/Correlated/{newsId}';
