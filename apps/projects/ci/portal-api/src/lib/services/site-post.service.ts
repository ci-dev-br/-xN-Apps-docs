/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { deleteSitePost } from '../fn/site-post/delete-site-post';
import { DeleteSitePost$Params } from '../fn/site-post/delete-site-post';
import { getByInternalIdSitePost } from '../fn/site-post/get-by-internal-id-site-post';
import { GetByInternalIdSitePost$Params } from '../fn/site-post/get-by-internal-id-site-post';
import { getListSitePost } from '../fn/site-post/get-list-site-post';
import { GetListSitePost$Params } from '../fn/site-post/get-list-site-post';
import { SitePost } from '../models/site-post';
import { syncSitePost } from '../fn/site-post/sync-site-post';
import { SyncSitePost$Params } from '../fn/site-post/sync-site-post';

@Injectable()
export class SitePostService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncSitePost()` */
  static readonly SyncSitePostPath = '/SitePost/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncSitePost()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncSitePost$Response(params: SyncSitePost$Params, context?: HttpContext): Observable<StrictHttpResponse<SitePost>> {
    return syncSitePost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncSitePost$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncSitePost$Params, context?: HttpContext): Observable<SitePost> {
    return this.syncSitePost$Response(params, context).pipe(
      map((r: StrictHttpResponse<SitePost>): SitePost => r.body)
    );
  }

  /** Path part for operation `getByInternalIdSitePost()` */
  static readonly GetByInternalIdSitePostPath = '/SitePost/GetByInternalId';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getByInternalIdSitePost()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalIdSitePost$Response(params: GetByInternalIdSitePost$Params, context?: HttpContext): Observable<StrictHttpResponse<SitePost>> {
    return getByInternalIdSitePost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getByInternalIdSitePost$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalId(params: GetByInternalIdSitePost$Params, context?: HttpContext): Observable<SitePost> {
    return this.getByInternalIdSitePost$Response(params, context).pipe(
      map((r: StrictHttpResponse<SitePost>): SitePost => r.body)
    );
  }

  /** Path part for operation `getListSitePost()` */
  static readonly GetListSitePostPath = '/SitePost/GetList';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListSitePost()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListSitePost$Response(params: GetListSitePost$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<SitePost>>> {
    return getListSitePost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListSitePost$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListSitePost$Params, context?: HttpContext): Observable<Array<SitePost>> {
    return this.getListSitePost$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<SitePost>>): Array<SitePost> => r.body)
    );
  }

  /** Path part for operation `deleteSitePost()` */
  static readonly DeleteSitePostPath = '/SitePost/Delete';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `deleteSitePost()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  deleteSitePost$Response(params: DeleteSitePost$Params, context?: HttpContext): Observable<StrictHttpResponse<SitePost>> {
    return deleteSitePost(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `deleteSitePost$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  delete(params: DeleteSitePost$Params, context?: HttpContext): Observable<SitePost> {
    return this.deleteSitePost$Response(params, context).pipe(
      map((r: StrictHttpResponse<SitePost>): SitePost => r.body)
    );
  }

}
