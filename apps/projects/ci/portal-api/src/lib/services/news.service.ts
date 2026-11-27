/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { getCorrelatedNews } from '../fn/news/get-correlated-news';
import { GetCorrelatedNews$Params } from '../fn/news/get-correlated-news';
import { getCorrelatedNewsById } from '../fn/news/get-correlated-news-by-id';
import { GetCorrelatedNewsById$Params } from '../fn/news/get-correlated-news-by-id';
import { getFeed } from '../fn/news/get-feed';
import { GetFeed$Params } from '../fn/news/get-feed';
import { getMarketNews } from '../fn/news/get-market-news';
import { GetMarketNews$Params } from '../fn/news/get-market-news';
import { getReaderNewsDigest } from '../fn/news/get-reader-news-digest';
import { GetReaderNewsDigest$Params } from '../fn/news/get-reader-news-digest';
import { News } from '../models/news';
import { newsAnonymousSession } from '../fn/news/news-anonymous-session';
import { NewsAnonymousSession$Params } from '../fn/news/news-anonymous-session';
import { newsComment } from '../fn/news/news-comment';
import { NewsComment$Params } from '../fn/news/news-comment';
import { newsGetComments } from '../fn/news/news-get-comments';
import { NewsGetComments$Params } from '../fn/news/news-get-comments';
import { newsVote } from '../fn/news/news-vote';
import { NewsVote$Params } from '../fn/news/news-vote';
import { newsVoteStats } from '../fn/news/news-vote-stats';
import { NewsVoteStats$Params } from '../fn/news/news-vote-stats';
import { ReaderNewsDigestDto } from '../models/reader-news-digest-dto';

@Injectable()
export class NewsService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `newsAnonymousSession()` */
  static readonly NewsAnonymousSessionPath = '/News/AnonymousSession';

  /**
   * Cria ou recupera usuário temporário para cliente anônimo conectado.
   *
   *
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `newsAnonymousSession()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  newsAnonymousSession$Response(params: NewsAnonymousSession$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return newsAnonymousSession(this.http, this.rootUrl, params, context);
  }

  /**
   * Cria ou recupera usuário temporário para cliente anônimo conectado.
   *
   *
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `newsAnonymousSession$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  newsAnonymousSession(params: NewsAnonymousSession$Params, context?: HttpContext): Observable<void> {
    return this.newsAnonymousSession$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `getMarketNews()` */
  static readonly GetMarketNewsPath = '/News/Market';

  /**
   * Obtém notícias de mercado e economia da base de dados.
   *
   *
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getMarketNews()` instead.
   *
   * This method doesn't expect any request body.
   */
  getMarketNews$Response(params?: GetMarketNews$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<News>>> {
    return getMarketNews(this.http, this.rootUrl, params, context);
  }

  /**
   * Obtém notícias de mercado e economia da base de dados.
   *
   *
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getMarketNews$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getMarket(params?: GetMarketNews$Params, context?: HttpContext): Observable<Array<News>> {
    return this.getMarketNews$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<News>>): Array<News> => r.body)
    );
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

  /** Path part for operation `getCorrelatedNewsById()` */
  static readonly GetCorrelatedNewsByIdPath = '/News/Correlated/{newsId}';

  /**
   * Pesquisa matérias correlatas via PostgreSQL Full-Text Search.
   *
   *
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getCorrelatedNewsById()` instead.
   *
   * This method doesn't expect any request body.
   */
  getCorrelatedNewsById$Response(params: GetCorrelatedNewsById$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<News>>> {
    return getCorrelatedNewsById(this.http, this.rootUrl, params, context);
  }

  /**
   * Pesquisa matérias correlatas via PostgreSQL Full-Text Search.
   *
   *
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getCorrelatedNewsById$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getCorrelatedById(params: GetCorrelatedNewsById$Params, context?: HttpContext): Observable<Array<News>> {
    return this.getCorrelatedNewsById$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<News>>): Array<News> => r.body)
    );
  }

  /** Path part for operation `getCorrelatedNews()` */
  static readonly GetCorrelatedNewsPath = '/News/Correlated';

  /**
   * Cruza conteúdo ou frase selecionada com outras matérias usando PostgreSQL + TypeORM.
   *
   *
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getCorrelatedNews()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getCorrelatedNews$Response(params: GetCorrelatedNews$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<News>>> {
    return getCorrelatedNews(this.http, this.rootUrl, params, context);
  }

  /**
   * Cruza conteúdo ou frase selecionada com outras matérias usando PostgreSQL + TypeORM.
   *
   *
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getCorrelatedNews$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getCorrelated(params: GetCorrelatedNews$Params, context?: HttpContext): Observable<Array<News>> {
    return this.getCorrelatedNews$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<News>>): Array<News> => r.body)
    );
  }

  /** Path part for operation `getReaderNewsDigest()` */
  static readonly GetReaderNewsDigestPath = '/News/ReaderDigest';

  /**
   * Retorna o boletim de notícias mais curtidas agrupadas por similaridade para usuários READER.
   *
   *
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getReaderNewsDigest()` instead.
   *
   * This method doesn't expect any request body.
   */
  getReaderNewsDigest$Response(params?: GetReaderNewsDigest$Params, context?: HttpContext): Observable<StrictHttpResponse<ReaderNewsDigestDto>> {
    return getReaderNewsDigest(this.http, this.rootUrl, params, context);
  }

  /**
   * Retorna o boletim de notícias mais curtidas agrupadas por similaridade para usuários READER.
   *
   *
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getReaderNewsDigest$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getReaderDigest(params?: GetReaderNewsDigest$Params, context?: HttpContext): Observable<ReaderNewsDigestDto> {
    return this.getReaderNewsDigest$Response(params, context).pipe(
      map((r: StrictHttpResponse<ReaderNewsDigestDto>): ReaderNewsDigestDto => r.body)
    );
  }

}
