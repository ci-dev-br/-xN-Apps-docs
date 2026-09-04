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
import { newsControllerGetCategories } from '../fn/news/news-controller-get-categories';
import { NewsControllerGetCategories$Params } from '../fn/news/news-controller-get-categories';
import { newsControllerGetFeed } from '../fn/news/news-controller-get-feed';
import { NewsControllerGetFeed$Params } from '../fn/news/news-controller-get-feed';
import { newsControllerPesquisar } from '../fn/news/news-controller-pesquisar';
import { NewsControllerPesquisar$Params } from '../fn/news/news-controller-pesquisar';

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

  /** Path part for operation `newsControllerGetFeed()` */
  static readonly NewsControllerGetFeedPath = '/News/getFeed';

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
  newsControllerGetFeed$Response(params?: NewsControllerGetFeed$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<FeedColumnDto>>> {
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
  newsControllerGetFeed(params?: NewsControllerGetFeed$Params, context?: HttpContext): Observable<Array<FeedColumnDto>> {
    return this.newsControllerGetFeed$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<FeedColumnDto>>): Array<FeedColumnDto> => r.body)
    );
  }

  /** Path part for operation `newsControllerPesquisar()` */
  static readonly NewsControllerPesquisarPath = '/News/pesquisar';

  /**
   * Pesquisar notícias por termo e período, retornando feed agrupado por fonte (Source) e ordenado por data de publicação.
   *
   *
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `newsControllerPesquisar()` instead.
   *
   * This method doesn't expect any request body.
   */
  newsControllerPesquisar$Response(params?: NewsControllerPesquisar$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<FeedColumnDto>>> {
    return newsControllerPesquisar(this.http, this.rootUrl, params, context);
  }

  /**
   * Pesquisar notícias por termo e período, retornando feed agrupado por fonte (Source) e ordenado por data de publicação.
   *
   *
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `newsControllerPesquisar$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  newsControllerPesquisar(params?: NewsControllerPesquisar$Params, context?: HttpContext): Observable<Array<FeedColumnDto>> {
    return this.newsControllerPesquisar$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<FeedColumnDto>>): Array<FeedColumnDto> => r.body)
    );
  }

}
