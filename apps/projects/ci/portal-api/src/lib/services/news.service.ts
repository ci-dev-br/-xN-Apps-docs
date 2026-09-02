/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { Category } from '../models/category';
import { FeedColumnDto } from '../models/feed-column-dto';
import { News } from '../models/news';
import { newsControllerGetCategories } from '../fn/news/news-controller-get-categories';
import { NewsControllerGetCategories$Params } from '../fn/news/news-controller-get-categories';
import { newsControllerGetFeed } from '../fn/news/news-controller-get-feed';
import { NewsControllerGetFeed$Params } from '../fn/news/news-controller-get-feed';
import { newsControllerGetNewsByCategory } from '../fn/news/news-controller-get-news-by-category';
import { NewsControllerGetNewsByCategory$Params } from '../fn/news/news-controller-get-news-by-category';

@Injectable()
export class NewsService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `newsControllerGetCategories()` */
  static readonly NewsControllerGetCategoriesPath = '/News/categories';

  /**
   * Lista todas as categorias catalogadas.
   *
   *
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `newsControllerGetCategories()` instead.
   *
   * This method doesn't expect any request body.
   */
  newsControllerGetCategories$Response(params?: NewsControllerGetCategories$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<Category>>> {
    return newsControllerGetCategories(this.http, this.rootUrl, params, context);
  }

  /**
   * Lista todas as categorias catalogadas.
   *
   *
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `newsControllerGetCategories$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  newsControllerGetCategories(params?: NewsControllerGetCategories$Params, context?: HttpContext): Observable<Array<Category>> {
    return this.newsControllerGetCategories$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<Category>>): Array<Category> => r.body)
    );
  }

  /** Path part for operation `newsControllerGetNewsByCategory()` */
  static readonly NewsControllerGetNewsByCategoryPath = '/News/{categoryId}';

  /**
   * Busca notícias por categoria.
   *
   *
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `newsControllerGetNewsByCategory()` instead.
   *
   * This method doesn't expect any request body.
   */
  newsControllerGetNewsByCategory$Response(params: NewsControllerGetNewsByCategory$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<News>>> {
    return newsControllerGetNewsByCategory(this.http, this.rootUrl, params, context);
  }

  /**
   * Busca notícias por categoria.
   *
   *
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `newsControllerGetNewsByCategory$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  newsControllerGetByCategory(params: NewsControllerGetNewsByCategory$Params, context?: HttpContext): Observable<Array<News>> {
    return this.newsControllerGetNewsByCategory$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<News>>): Array<News> => r.body)
    );
  }

  /** Path part for operation `newsControllerGetFeed()` */
  static readonly NewsControllerGetFeedPath = '/News';

  /**
   * Retorna o feed de notícias agrupado por fonte, filtrado pelas top tendências do período.
   *
   *
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `newsControllerGetFeed()` instead.
   *
   * This method doesn't expect any request body.
   */
  newsControllerGetFeed$Response(params: NewsControllerGetFeed$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<FeedColumnDto>>> {
    return newsControllerGetFeed(this.http, this.rootUrl, params, context);
  }

  /**
   * Retorna o feed de notícias agrupado por fonte, filtrado pelas top tendências do período.
   *
   *
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `newsControllerGetFeed$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  newsControllerGetFeed(params: NewsControllerGetFeed$Params, context?: HttpContext): Observable<Array<FeedColumnDto>> {
    return this.newsControllerGetFeed$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<FeedColumnDto>>): Array<FeedColumnDto> => r.body)
    );
  }

}
