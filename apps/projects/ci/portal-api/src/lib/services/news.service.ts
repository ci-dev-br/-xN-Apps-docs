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
import { getMarketNews } from '../fn/news/get-market-news';
import { GetMarketNews$Params } from '../fn/news/get-market-news';
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

  /**
   * Obtém ou gera um identificador persistente para o cliente anônimo conectado.
   */
  getOrCreateAnonymousId(): string {
    try {
      if (typeof localStorage !== 'undefined') {
        let anonId = localStorage.getItem('ci_anonymous_client_id');
        if (!anonId || anonId.length < 8) {
          const rand = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
          anonId = `anon-${rand}`;
          localStorage.setItem('ci_anonymous_client_id', anonId);
        }
        return anonId;
      }
    } catch { }
    return 'anon-session-default';
  }

  getAnonymousAuthorName(): string {
    try {
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem('ci_anonymous_author_name') || '';
      }
    } catch { }
    return '';
  }

  setAnonymousAuthorName(name: string): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('ci_anonymous_author_name', (name || '').trim());
      }
    } catch { }
  }

  initAnonymousSession(authorName?: string, context?: HttpContext): Observable<{
    isAnonymous: boolean;
    anonymousId: string;
    user: { id: string; username: string; fullName: string; surname: string; roles: string[] } | null;
  }> {
    const anonymousId = this.getOrCreateAnonymousId();
    if (authorName !== undefined) {
      this.setAnonymousAuthorName(authorName);
    }
    const savedName = authorName !== undefined ? authorName : this.getAnonymousAuthorName();
    return this.http.post<any>(
      `${this.rootUrl}/News/AnonymousSession`,
      { anonymousId, authorName: savedName || undefined },
      { headers: { 'x-anonymous-id': anonymousId }, context }
    );
  }

  /**
   * Obtém notícias de mercado e economia da base de dados (alias direto utilizado pelo Radar de Mercado e Ticker).
   */
  getMarketNews(params?: GetMarketNews$Params, context?: HttpContext): Observable<Array<News>> {
    const anonymousId = this.getOrCreateAnonymousId();
    const queryParams: string[] = [`anonymousId=${encodeURIComponent(anonymousId)}`];
    if (params?.search) queryParams.push(`search=${encodeURIComponent(params.search)}`);
    if (params?.category) queryParams.push(`category=${encodeURIComponent(params.category)}`);
    if (params?.limit !== undefined) queryParams.push(`limit=${params.limit}`);
    if (params?.offset !== undefined) queryParams.push(`offset=${params.offset}`);
    const qs = queryParams.length ? `?${queryParams.join('&')}` : '';
    return this.http.get<Array<News>>(`${this.rootUrl}/News/Market${qs}`, {
      headers: { 'x-anonymous-id': anonymousId },
      context
    });
  }

  vote(newsId: string, vote: 'UP' | 'DOWN', context?: HttpContext): Observable<any> {
    const anonymousId = this.getOrCreateAnonymousId();
    return this.http.post<any>(
      `${this.rootUrl}/News/Vote`,
      { newsId, vote, anonymousId },
      { headers: { 'x-anonymous-id': anonymousId }, context }
    );
  }

  getVoteStats(newsId: string, context?: HttpContext): Observable<any> {
    const anonymousId = this.getOrCreateAnonymousId();
    return this.http.get<any>(
      `${this.rootUrl}/News/VoteStats/${encodeURIComponent(newsId)}?anonymousId=${encodeURIComponent(anonymousId)}`,
      { headers: { 'x-anonymous-id': anonymousId }, context }
    );
  }

  comment(newsId: string, content: string, authorName?: string, context?: HttpContext): Observable<any> {
    const anonymousId = this.getOrCreateAnonymousId();
    if (authorName && authorName.trim()) {
      this.setAnonymousAuthorName(authorName.trim());
    }
    const resolvedAuthorName = (authorName?.trim() || this.getAnonymousAuthorName()) || undefined;
    return this.http.post<any>(
      `${this.rootUrl}/News/Comment`,
      { newsId, content, anonymousId, authorName: resolvedAuthorName },
      { headers: { 'x-anonymous-id': anonymousId }, context }
    );
  }

  getComments(newsId: string, context?: HttpContext): Observable<Array<any>> {
    const anonymousId = this.getOrCreateAnonymousId();
    return this.http.get<Array<any>>(
      `${this.rootUrl}/News/Comments/${encodeURIComponent(newsId)}?anonymousId=${encodeURIComponent(anonymousId)}`,
      { headers: { 'x-anonymous-id': anonymousId }, context }
    );
  }

  followUser(userId: string, context?: HttpContext): Observable<any> {
    return this.http.post<any>(`${this.rootUrl}/Social/Follow/${encodeURIComponent(userId)}`, {}, { context });
  }

  unfollowUser(userId: string, context?: HttpContext): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.rootUrl}/Social/Unfollow/${encodeURIComponent(userId)}`, {}, { context });
  }

  getSocialStatus(userId: string, context?: HttpContext): Observable<{ isFollowing: boolean; isFollower: boolean; isConhecido: boolean; tipo: string }> {
    return this.http.get<{ isFollowing: boolean; isFollower: boolean; isConhecido: boolean; tipo: string }>(`${this.rootUrl}/Social/Status/${encodeURIComponent(userId)}`, { context });
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
    const anonymousId = this.getOrCreateAnonymousId();
    const queryParams: string[] = [`anonymousId=${encodeURIComponent(anonymousId)}`];
    if (params?.dataInicial) queryParams.push(`dataInicial=${encodeURIComponent(params.dataInicial)}`);
    if (params?.dataFinal) queryParams.push(`dataFinal=${encodeURIComponent(params.dataFinal)}`);
    if ((params as any)?.offset !== undefined) queryParams.push(`offset=${(params as any).offset}`);
    const qs = queryParams.length ? `?${queryParams.join('&')}` : '';
    return this.http.post<Array<News>>(
      `${this.rootUrl}/News/getFeed${qs}`,
      {},
      { headers: { 'x-anonymous-id': anonymousId }, context }
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
