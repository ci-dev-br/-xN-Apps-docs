/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { getFeed } from '../fn/news/get-feed';
import { GetFeed$Params } from '../fn/news/get-feed';
import { News } from '../models/news';

@Injectable()
export class NewsService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `getFeed()` */
  static readonly GetFeedPath = '/News/getFeed';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getFeed()` instead.
   *
   * This method doesn't expect any request body.
   */
  getFeed$Response(params: GetFeed$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<News>>> {
    return getFeed(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getFeed$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getFeed(params: GetFeed$Params, context?: HttpContext): Observable<Array<News>> {
    return this.getFeed$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<News>>): Array<News> => r.body)
    );
  }

}
