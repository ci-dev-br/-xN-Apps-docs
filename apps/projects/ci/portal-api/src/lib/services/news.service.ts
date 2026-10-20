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
import { newsComment } from '../fn/news/news-comment';
import { NewsComment$Params } from '../fn/news/news-comment';
import { newsGetComments } from '../fn/news/news-get-comments';
import { NewsGetComments$Params } from '../fn/news/news-get-comments';
import { newsVote } from '../fn/news/news-vote';
import { NewsVote$Params } from '../fn/news/news-vote';
import { newsVoteStats } from '../fn/news/news-vote-stats';
import { NewsVoteStats$Params } from '../fn/news/news-vote-stats';

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

  /** Path part for operation `newsVote()` */
  static readonly NewsVotePath = '/News/Vote';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `newsVote()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  newsVote$Response(params: NewsVote$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return newsVote(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `newsVote$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  newsVote(params: NewsVote$Params, context?: HttpContext): Observable<void> {
    return this.newsVote$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `newsVoteStats()` */
  static readonly NewsVoteStatsPath = '/News/VoteStats/{newsId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `newsVoteStats()` instead.
   *
   * This method doesn't expect any request body.
   */
  newsVoteStats$Response(params: NewsVoteStats$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return newsVoteStats(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `newsVoteStats$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  newsVoteStats(params: NewsVoteStats$Params, context?: HttpContext): Observable<void> {
    return this.newsVoteStats$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `newsComment()` */
  static readonly NewsCommentPath = '/News/Comment';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `newsComment()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  newsComment$Response(params: NewsComment$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return newsComment(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `newsComment$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  newsComment(params: NewsComment$Params, context?: HttpContext): Observable<void> {
    return this.newsComment$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `newsGetComments()` */
  static readonly NewsGetCommentsPath = '/News/Comments/{newsId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `newsGetComments()` instead.
   *
   * This method doesn't expect any request body.
   */
  newsGetComments$Response(params: NewsGetComments$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return newsGetComments(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `newsGetComments$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  newsGetComments(params: NewsGetComments$Params, context?: HttpContext): Observable<void> {
    return this.newsGetComments$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

}
