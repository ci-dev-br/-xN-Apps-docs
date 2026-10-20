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

@Injectable()
export class NewsService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `getFeed()` */
  static readonly GetFeedPath = '/News/getFeed';

  getFeed$Response(params: GetFeed$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<News>>> {
    return getFeed(this.http, this.rootUrl, params, context);
  }

  getFeed(params: GetFeed$Params, context?: HttpContext): Observable<Array<News>> {
    return this.getFeed$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<News>>): Array<News> => r.body)
    );
  }

  /**
   * Envia voto UP ou DOWN para a notícia informada.
   */
  vote(newsId: string, vote: 'UP' | 'DOWN', context?: HttpContext): Observable<NewsVoteStats> {
    return this.http.post<NewsVoteStats>(`${this.rootUrl}/News/Vote`, { newsId, vote }, { context });
  }

  /**
   * Obtém as estatísticas de votos da notícia.
   */
  getVoteStats(newsId: string, context?: HttpContext): Observable<NewsVoteStats> {
    return this.http.get<NewsVoteStats>(`${this.rootUrl}/News/VoteStats/${newsId}`, { context });
  }

  /**
   * Publica um comentário na notícia.
   */
  comment(newsId: string, content: string, context?: HttpContext): Observable<NewsCommentItem> {
    return this.http.post<NewsCommentItem>(`${this.rootUrl}/News/Comment`, { newsId, content }, { context });
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
   * Obtém o status do vínculo social entre o usuário logado e outro usuário.
   */
  getSocialStatus(userId: string, context?: HttpContext): Observable<{ isFollowing: boolean; isFollower: boolean; isConhecido: boolean; tipo: string }> {
    return this.http.get<any>(`${this.rootUrl}/Social/Status/${userId}`, { context });
  }
}
