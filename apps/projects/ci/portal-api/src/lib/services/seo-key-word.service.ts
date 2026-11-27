/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { deleteSeoKeyWord } from '../fn/seo-key-word/delete-seo-key-word';
import { DeleteSeoKeyWord$Params } from '../fn/seo-key-word/delete-seo-key-word';
import { getByInternalIdSeoKeyWord } from '../fn/seo-key-word/get-by-internal-id-seo-key-word';
import { GetByInternalIdSeoKeyWord$Params } from '../fn/seo-key-word/get-by-internal-id-seo-key-word';
import { getListSeoKeyWord } from '../fn/seo-key-word/get-list-seo-key-word';
import { GetListSeoKeyWord$Params } from '../fn/seo-key-word/get-list-seo-key-word';
import { SeoKeyWord } from '../models/seo-key-word';
import { syncSeoKeyWord } from '../fn/seo-key-word/sync-seo-key-word';
import { SyncSeoKeyWord$Params } from '../fn/seo-key-word/sync-seo-key-word';

@Injectable()
export class SeoKeyWordService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncSeoKeyWord()` */
  static readonly SyncSeoKeyWordPath = '/SeoKeyWord/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncSeoKeyWord()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncSeoKeyWord$Response(params: SyncSeoKeyWord$Params, context?: HttpContext): Observable<StrictHttpResponse<SeoKeyWord>> {
    return syncSeoKeyWord(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncSeoKeyWord$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncSeoKeyWord$Params, context?: HttpContext): Observable<SeoKeyWord> {
    return this.syncSeoKeyWord$Response(params, context).pipe(
      map((r: StrictHttpResponse<SeoKeyWord>): SeoKeyWord => r.body)
    );
  }

  /** Path part for operation `getByInternalIdSeoKeyWord()` */
  static readonly GetByInternalIdSeoKeyWordPath = '/SeoKeyWord/GetByInternalId';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getByInternalIdSeoKeyWord()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalIdSeoKeyWord$Response(params: GetByInternalIdSeoKeyWord$Params, context?: HttpContext): Observable<StrictHttpResponse<SeoKeyWord>> {
    return getByInternalIdSeoKeyWord(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getByInternalIdSeoKeyWord$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalId(params: GetByInternalIdSeoKeyWord$Params, context?: HttpContext): Observable<SeoKeyWord> {
    return this.getByInternalIdSeoKeyWord$Response(params, context).pipe(
      map((r: StrictHttpResponse<SeoKeyWord>): SeoKeyWord => r.body)
    );
  }

  /** Path part for operation `getListSeoKeyWord()` */
  static readonly GetListSeoKeyWordPath = '/SeoKeyWord/GetList';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListSeoKeyWord()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListSeoKeyWord$Response(params: GetListSeoKeyWord$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<SeoKeyWord>>> {
    return getListSeoKeyWord(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListSeoKeyWord$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListSeoKeyWord$Params, context?: HttpContext): Observable<Array<SeoKeyWord>> {
    return this.getListSeoKeyWord$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<SeoKeyWord>>): Array<SeoKeyWord> => r.body)
    );
  }

  /** Path part for operation `deleteSeoKeyWord()` */
  static readonly DeleteSeoKeyWordPath = '/SeoKeyWord/Delete';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `deleteSeoKeyWord()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  deleteSeoKeyWord$Response(params: DeleteSeoKeyWord$Params, context?: HttpContext): Observable<StrictHttpResponse<SeoKeyWord>> {
    return deleteSeoKeyWord(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `deleteSeoKeyWord$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  delete(params: DeleteSeoKeyWord$Params, context?: HttpContext): Observable<SeoKeyWord> {
    return this.deleteSeoKeyWord$Response(params, context).pipe(
      map((r: StrictHttpResponse<SeoKeyWord>): SeoKeyWord => r.body)
    );
  }

}
