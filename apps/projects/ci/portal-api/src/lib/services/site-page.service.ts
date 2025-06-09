/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { getListSitePage } from '../fn/site-page/get-list-site-page';
import { GetListSitePage$Params } from '../fn/site-page/get-list-site-page';
import { SitePage } from '../models/site-page';
import { syncSitePage } from '../fn/site-page/sync-site-page';
import { SyncSitePage$Params } from '../fn/site-page/sync-site-page';

@Injectable()
export class SitePageService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncSitePage()` */
  static readonly SyncSitePagePath = '/SitePage/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncSitePage()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncSitePage$Response(params: SyncSitePage$Params, context?: HttpContext): Observable<StrictHttpResponse<SitePage>> {
    return syncSitePage(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncSitePage$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncSitePage$Params, context?: HttpContext): Observable<SitePage> {
    return this.syncSitePage$Response(params, context).pipe(
      map((r: StrictHttpResponse<SitePage>): SitePage => r.body)
    );
  }

  /** Path part for operation `getListSitePage()` */
  static readonly GetListSitePagePath = '/SitePage/GetList';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListSitePage()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListSitePage$Response(params: GetListSitePage$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<SitePage>>> {
    return getListSitePage(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListSitePage$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListSitePage$Params, context?: HttpContext): Observable<Array<SitePage>> {
    return this.getListSitePage$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<SitePage>>): Array<SitePage> => r.body)
    );
  }

}
