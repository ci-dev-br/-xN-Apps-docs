/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { deleteSeoPage } from '../fn/seo-page/delete-seo-page';
import { DeleteSeoPage$Params } from '../fn/seo-page/delete-seo-page';
import { getByInternalIdSeoPage } from '../fn/seo-page/get-by-internal-id-seo-page';
import { GetByInternalIdSeoPage$Params } from '../fn/seo-page/get-by-internal-id-seo-page';
import { getListSeoPage } from '../fn/seo-page/get-list-seo-page';
import { GetListSeoPage$Params } from '../fn/seo-page/get-list-seo-page';
import { SeoPage } from '../models/seo-page';
import { syncSeoPage } from '../fn/seo-page/sync-seo-page';
import { SyncSeoPage$Params } from '../fn/seo-page/sync-seo-page';

@Injectable()
export class SeoPageService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncSeoPage()` */
  static readonly SyncSeoPagePath = '/SeoPage/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncSeoPage()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncSeoPage$Response(params: SyncSeoPage$Params, context?: HttpContext): Observable<StrictHttpResponse<SeoPage>> {
    return syncSeoPage(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncSeoPage$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncSeoPage$Params, context?: HttpContext): Observable<SeoPage> {
    return this.syncSeoPage$Response(params, context).pipe(
      map((r: StrictHttpResponse<SeoPage>): SeoPage => r.body)
    );
  }

  /** Path part for operation `getByInternalIdSeoPage()` */
  static readonly GetByInternalIdSeoPagePath = '/SeoPage/GetByInternalId';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getByInternalIdSeoPage()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalIdSeoPage$Response(params: GetByInternalIdSeoPage$Params, context?: HttpContext): Observable<StrictHttpResponse<SeoPage>> {
    return getByInternalIdSeoPage(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getByInternalIdSeoPage$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalId(params: GetByInternalIdSeoPage$Params, context?: HttpContext): Observable<SeoPage> {
    return this.getByInternalIdSeoPage$Response(params, context).pipe(
      map((r: StrictHttpResponse<SeoPage>): SeoPage => r.body)
    );
  }

  /** Path part for operation `getListSeoPage()` */
  static readonly GetListSeoPagePath = '/SeoPage/GetList';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListSeoPage()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListSeoPage$Response(params: GetListSeoPage$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<SeoPage>>> {
    return getListSeoPage(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListSeoPage$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListSeoPage$Params, context?: HttpContext): Observable<Array<SeoPage>> {
    return this.getListSeoPage$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<SeoPage>>): Array<SeoPage> => r.body)
    );
  }

  /** Path part for operation `deleteSeoPage()` */
  static readonly DeleteSeoPagePath = '/SeoPage/Delete';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `deleteSeoPage()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  deleteSeoPage$Response(params: DeleteSeoPage$Params, context?: HttpContext): Observable<StrictHttpResponse<SeoPage>> {
    return deleteSeoPage(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `deleteSeoPage$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  delete(params: DeleteSeoPage$Params, context?: HttpContext): Observable<SeoPage> {
    return this.deleteSeoPage$Response(params, context).pipe(
      map((r: StrictHttpResponse<SeoPage>): SeoPage => r.body)
    );
  }

}
