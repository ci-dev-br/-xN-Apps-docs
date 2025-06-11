/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { deleteSiteOption } from '../fn/site-option/delete-site-option';
import { DeleteSiteOption$Params } from '../fn/site-option/delete-site-option';
import { getListSiteOption } from '../fn/site-option/get-list-site-option';
import { GetListSiteOption$Params } from '../fn/site-option/get-list-site-option';
import { SiteOption } from '../models/site-option';
import { syncSiteOption } from '../fn/site-option/sync-site-option';
import { SyncSiteOption$Params } from '../fn/site-option/sync-site-option';

@Injectable()
export class SiteOptionService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncSiteOption()` */
  static readonly SyncSiteOptionPath = '/SiteOption/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncSiteOption()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncSiteOption$Response(params: SyncSiteOption$Params, context?: HttpContext): Observable<StrictHttpResponse<SiteOption>> {
    return syncSiteOption(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncSiteOption$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncSiteOption$Params, context?: HttpContext): Observable<SiteOption> {
    return this.syncSiteOption$Response(params, context).pipe(
      map((r: StrictHttpResponse<SiteOption>): SiteOption => r.body)
    );
  }

  /** Path part for operation `getListSiteOption()` */
  static readonly GetListSiteOptionPath = '/SiteOption/GetList';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListSiteOption()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListSiteOption$Response(params: GetListSiteOption$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<SiteOption>>> {
    return getListSiteOption(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListSiteOption$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListSiteOption$Params, context?: HttpContext): Observable<Array<SiteOption>> {
    return this.getListSiteOption$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<SiteOption>>): Array<SiteOption> => r.body)
    );
  }

  /** Path part for operation `deleteSiteOption()` */
  static readonly DeleteSiteOptionPath = '/SiteOption/Delete';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `deleteSiteOption()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  deleteSiteOption$Response(params: DeleteSiteOption$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<SiteOption>>> {
    return deleteSiteOption(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `deleteSiteOption$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  delete(params: DeleteSiteOption$Params, context?: HttpContext): Observable<Array<SiteOption>> {
    return this.deleteSiteOption$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<SiteOption>>): Array<SiteOption> => r.body)
    );
  }

}
