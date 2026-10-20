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

export interface NewsVoteStats {
  newsId: string;
  upVotes: number;
  downVotes: number;
  userVote: 'UP' | 'DOWN' | null;
}

export interface NewsCommentItem {
  id: string;
  content: string;
  createdAt: string | Date;
  user?: {
    id?: string;
    username?: string;
    fullName?: string;
    surname?: string;
    photo?: any;
  } | null;
  socialStatus?: {
    tipo?: 'SELF' | 'CONHECIDO' | 'SEGUINDO' | 'SEGUIDOR' | 'NENHUM';
    isFollowing?: boolean;
    isFollower?: boolean;
    isConhecido?: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
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
  getFeed(params?: GetFeed$Params, context?: HttpContext): Observable<Array<News>> {
    return this.getFeed$Response(params || { offset: 0 }, context).pipe(
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

  /**
   * Envia voto UP ou DOWN para a notícia informada.
   */
  vote(newsId: string, vote: 'UP' | 'DOWN', context?: HttpContext): Observable<NewsVoteStats> {
    return this.http.post<NewsVoteStats>(`${this.rootUrl}/News/Vote`, { newsId, vote }, { context });
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

  /**
   * Obtém as estatísticas de votos da notícia.
   */
  getVoteStats(newsId: string, context?: HttpContext): Observable<NewsVoteStats> {
    return this.http.get<NewsVoteStats>(`${this.rootUrl}/News/VoteStats/${newsId}`, { context });
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
  newsComment(params: NewsComment$Params, context?: HttpContext): Observable<void>;
  newsComment(newsId: string, content: string, context?: HttpContext): Observable<NewsCommentItem>;
  newsComment(arg1: any, arg2?: any, arg3?: any): Observable<any> {
    if (typeof arg1 === 'string') {
      return this.comment(arg1, arg2, arg3);
    }
    return this.newsComment$Response(arg1, arg2).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /**
   * Publica um comentário na notícia.
   */
  comment(newsId: string, content: string, context?: HttpContext): Observable<NewsCommentItem> {
    return this.http.post<NewsCommentItem>(`${this.rootUrl}/News/Comment`, { newsId, content }, { context });
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

  /**
   * Carrega a lista de comentários de uma notícia com o status de vínculo social.
   */
  getComments(newsId: string, context?: HttpContext): Observable<Array<NewsCommentItem>> {
    return this.http.get<Array<NewsCommentItem>>(`${this.rootUrl}/News/Comments/${newsId}`, { context });
  }

  /**
   * Segue um usuário. Se recíproco, ambos se tornam "conhecidos".
   */
  followUser(userId: string, context?: HttpContext): Observable<any> {
    return this.http.post<any>(`${this.rootUrl}/Social/Follow/${userId}`, {}, { context });
  }

  /**
   * Deixa de seguir um usuário.
   */
  unfollowUser(userId: string, context?: HttpContext): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.rootUrl}/Social/Unfollow/${userId}`, {}, { context });
  }

  /**
   * Obtém notícias filtradas de mercado e economia da base de dados.
   */
  getMarketNews(params?: { search?: string; category?: string; limit?: number; offset?: number }, context?: HttpContext): Observable<Array<News>> {
    const queryParams: string[] = [];
    if (params?.search) queryParams.push(`search=${encodeURIComponent(params.search)}`);
    if (params?.category) queryParams.push(`category=${encodeURIComponent(params.category)}`);
    if (params?.limit !== undefined) queryParams.push(`limit=${params.limit}`);
    if (params?.offset !== undefined) queryParams.push(`offset=${params.offset}`);
    const qs = queryParams.length ? `?${queryParams.join('&')}` : '';
    return this.http.get<Array<News>>(`${this.rootUrl}/News/Market${qs}`, { context });
  }

  /**
   * Obtém o status do vínculo social entre o usuário logado e outro usuário.
   */
  getSocialStatus(userId: string, context?: HttpContext): Observable<{ isFollowing: boolean; isFollower: boolean; isConhecido: boolean; tipo: string }> {
    return this.http.get<any>(`${this.rootUrl}/Social/Status/${userId}`, { context });
  }
}
