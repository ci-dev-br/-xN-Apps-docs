/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { FeedColumnDto } from '../../models/feed-column-dto';

export interface NewsControllerGetFeed$Params {
  dataInicial?: string;
  dataFinal?: string;
}

export function newsControllerGetFeed(http: HttpClient, rootUrl: string, params?: NewsControllerGetFeed$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<FeedColumnDto>>> {
  const rb = new RequestBuilder(rootUrl, newsControllerGetFeed.PATH, 'post');
  if (params) {
    rb.query('dataInicial', params.dataInicial, {});
    rb.query('dataFinal', params.dataFinal, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<FeedColumnDto>>;
    })
  );
}

newsControllerGetFeed.PATH = '/News/getFeed';
