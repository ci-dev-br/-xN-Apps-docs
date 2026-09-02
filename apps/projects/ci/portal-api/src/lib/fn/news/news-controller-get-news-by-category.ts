/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { News } from '../../models/news';

export interface NewsControllerGetNewsByCategory$Params {
  categoryId: string;
}

export function newsControllerGetNewsByCategory(http: HttpClient, rootUrl: string, params: NewsControllerGetNewsByCategory$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<News>>> {
  const rb = new RequestBuilder(rootUrl, newsControllerGetNewsByCategory.PATH, 'get');
  if (params) {
    rb.path('categoryId', params.categoryId, {});
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

newsControllerGetNewsByCategory.PATH = '/News/{categoryId}';
