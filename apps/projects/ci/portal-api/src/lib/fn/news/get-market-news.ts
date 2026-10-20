/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { News } from '../../models/news';

export interface GetMarketNews$Params {
  search?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

export function getMarketNews(http: HttpClient, rootUrl: string, params?: GetMarketNews$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<News>>> {
  const rb = new RequestBuilder(rootUrl, getMarketNews.PATH, 'get');
  if (params) {
    rb.query('search', params.search, {});
    rb.query('category', params.category, {});
    rb.query('limit', params.limit, {});
    rb.query('offset', params.offset, {});
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

getMarketNews.PATH = '/News/Market';
