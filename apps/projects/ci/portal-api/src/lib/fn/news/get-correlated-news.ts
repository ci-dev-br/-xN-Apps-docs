/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { CorrelatedSearchInputDto } from '../../models/correlated-search-input-dto';
import { News } from '../../models/news';

export interface GetCorrelatedNews$Params {
      body: CorrelatedSearchInputDto
}

export function getCorrelatedNews(http: HttpClient, rootUrl: string, params: GetCorrelatedNews$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<News>>> {
  const rb = new RequestBuilder(rootUrl, getCorrelatedNews.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
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

getCorrelatedNews.PATH = '/News/Correlated';
