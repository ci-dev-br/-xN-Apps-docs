/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { News } from '../../models/news';

export interface GetFeed$Params {
  dataInicial?: string;
  dataFinal?: string;
  offset: number;
}

export function getFeed(http: HttpClient, rootUrl: string, params: GetFeed$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<News>>> {
  const rb = new RequestBuilder(rootUrl, getFeed.PATH, 'post');
  if (params) {
    rb.query('dataInicial', params.dataInicial, {});
    rb.query('dataFinal', params.dataFinal, {});
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

getFeed.PATH = '/News/getFeed';
