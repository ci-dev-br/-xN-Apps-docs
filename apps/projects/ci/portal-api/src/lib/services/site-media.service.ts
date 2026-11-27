/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { deleteSiteMedia } from '../fn/site-media/delete-site-media';
import { DeleteSiteMedia$Params } from '../fn/site-media/delete-site-media';
import { getByInternalIdSiteMedia } from '../fn/site-media/get-by-internal-id-site-media';
import { GetByInternalIdSiteMedia$Params } from '../fn/site-media/get-by-internal-id-site-media';
import { getListSiteMedia } from '../fn/site-media/get-list-site-media';
import { GetListSiteMedia$Params } from '../fn/site-media/get-list-site-media';
import { SiteMedia } from '../models/site-media';
import { syncSiteMedia } from '../fn/site-media/sync-site-media';
import { SyncSiteMedia$Params } from '../fn/site-media/sync-site-media';

@Injectable()
export class SiteMediaService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncSiteMedia()` */
  static readonly SyncSiteMediaPath = '/SiteMedia/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncSiteMedia()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncSiteMedia$Response(params: SyncSiteMedia$Params, context?: HttpContext): Observable<StrictHttpResponse<SiteMedia>> {
    return syncSiteMedia(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncSiteMedia$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncSiteMedia$Params, context?: HttpContext): Observable<SiteMedia> {
    return this.syncSiteMedia$Response(params, context).pipe(
      map((r: StrictHttpResponse<SiteMedia>): SiteMedia => r.body)
    );
  }

  /** Path part for operation `getByInternalIdSiteMedia()` */
  static readonly GetByInternalIdSiteMediaPath = '/SiteMedia/GetByInternalId';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getByInternalIdSiteMedia()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalIdSiteMedia$Response(params: GetByInternalIdSiteMedia$Params, context?: HttpContext): Observable<StrictHttpResponse<SiteMedia>> {
    return getByInternalIdSiteMedia(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getByInternalIdSiteMedia$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalId(params: GetByInternalIdSiteMedia$Params, context?: HttpContext): Observable<SiteMedia> {
    return this.getByInternalIdSiteMedia$Response(params, context).pipe(
      map((r: StrictHttpResponse<SiteMedia>): SiteMedia => r.body)
    );
  }

  /** Path part for operation `getListSiteMedia()` */
  static readonly GetListSiteMediaPath = '/SiteMedia/GetList';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListSiteMedia()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListSiteMedia$Response(params: GetListSiteMedia$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<SiteMedia>>> {
    return getListSiteMedia(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListSiteMedia$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListSiteMedia$Params, context?: HttpContext): Observable<Array<SiteMedia>> {
    return this.getListSiteMedia$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<SiteMedia>>): Array<SiteMedia> => r.body)
    );
  }

  /** Path part for operation `deleteSiteMedia()` */
  static readonly DeleteSiteMediaPath = '/SiteMedia/Delete';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `deleteSiteMedia()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  deleteSiteMedia$Response(params: DeleteSiteMedia$Params, context?: HttpContext): Observable<StrictHttpResponse<SiteMedia>> {
    return deleteSiteMedia(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `deleteSiteMedia$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  delete(params: DeleteSiteMedia$Params, context?: HttpContext): Observable<SiteMedia> {
    return this.deleteSiteMedia$Response(params, context).pipe(
      map((r: StrictHttpResponse<SiteMedia>): SiteMedia => r.body)
    );
  }

}
