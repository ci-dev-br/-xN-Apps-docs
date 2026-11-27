/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { deleteSeoBackLink } from '../fn/seo-back-link/delete-seo-back-link';
import { DeleteSeoBackLink$Params } from '../fn/seo-back-link/delete-seo-back-link';
import { getByInternalIdSeoBackLink } from '../fn/seo-back-link/get-by-internal-id-seo-back-link';
import { GetByInternalIdSeoBackLink$Params } from '../fn/seo-back-link/get-by-internal-id-seo-back-link';
import { getListSeoBackLink } from '../fn/seo-back-link/get-list-seo-back-link';
import { GetListSeoBackLink$Params } from '../fn/seo-back-link/get-list-seo-back-link';
import { SeoBackLink } from '../models/seo-back-link';
import { syncSeoBackLink } from '../fn/seo-back-link/sync-seo-back-link';
import { SyncSeoBackLink$Params } from '../fn/seo-back-link/sync-seo-back-link';

@Injectable()
export class SeoBackLinkService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncSeoBackLink()` */
  static readonly SyncSeoBackLinkPath = '/SeoBackLink/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncSeoBackLink()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncSeoBackLink$Response(params: SyncSeoBackLink$Params, context?: HttpContext): Observable<StrictHttpResponse<SeoBackLink>> {
    return syncSeoBackLink(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncSeoBackLink$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncSeoBackLink$Params, context?: HttpContext): Observable<SeoBackLink> {
    return this.syncSeoBackLink$Response(params, context).pipe(
      map((r: StrictHttpResponse<SeoBackLink>): SeoBackLink => r.body)
    );
  }

  /** Path part for operation `getByInternalIdSeoBackLink()` */
  static readonly GetByInternalIdSeoBackLinkPath = '/SeoBackLink/GetByInternalId';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getByInternalIdSeoBackLink()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalIdSeoBackLink$Response(params: GetByInternalIdSeoBackLink$Params, context?: HttpContext): Observable<StrictHttpResponse<SeoBackLink>> {
    return getByInternalIdSeoBackLink(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getByInternalIdSeoBackLink$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalId(params: GetByInternalIdSeoBackLink$Params, context?: HttpContext): Observable<SeoBackLink> {
    return this.getByInternalIdSeoBackLink$Response(params, context).pipe(
      map((r: StrictHttpResponse<SeoBackLink>): SeoBackLink => r.body)
    );
  }

  /** Path part for operation `getListSeoBackLink()` */
  static readonly GetListSeoBackLinkPath = '/SeoBackLink/GetList';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListSeoBackLink()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListSeoBackLink$Response(params: GetListSeoBackLink$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<SeoBackLink>>> {
    return getListSeoBackLink(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListSeoBackLink$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListSeoBackLink$Params, context?: HttpContext): Observable<Array<SeoBackLink>> {
    return this.getListSeoBackLink$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<SeoBackLink>>): Array<SeoBackLink> => r.body)
    );
  }

  /** Path part for operation `deleteSeoBackLink()` */
  static readonly DeleteSeoBackLinkPath = '/SeoBackLink/Delete';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `deleteSeoBackLink()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  deleteSeoBackLink$Response(params: DeleteSeoBackLink$Params, context?: HttpContext): Observable<StrictHttpResponse<SeoBackLink>> {
    return deleteSeoBackLink(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `deleteSeoBackLink$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  delete(params: DeleteSeoBackLink$Params, context?: HttpContext): Observable<SeoBackLink> {
    return this.deleteSeoBackLink$Response(params, context).pipe(
      map((r: StrictHttpResponse<SeoBackLink>): SeoBackLink => r.body)
    );
  }

}
