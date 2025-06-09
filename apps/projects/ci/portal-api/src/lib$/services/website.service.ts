/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { getListWebsite } from '../fn/website/get-list-website';
import { GetListWebsite$Params } from '../fn/website/get-list-website';
import { syncWebsite } from '../fn/website/sync-website';
import { SyncWebsite$Params } from '../fn/website/sync-website';
import { Website } from '../models/website';

@Injectable()
export class WebsiteService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncWebsite()` */
  static readonly SyncWebsitePath = '/Website/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncWebsite()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncWebsite$Response(params: SyncWebsite$Params, context?: HttpContext): Observable<StrictHttpResponse<Website>> {
    return syncWebsite(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncWebsite$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncWebsite$Params, context?: HttpContext): Observable<Website> {
    return this.syncWebsite$Response(params, context).pipe(
      map((r: StrictHttpResponse<Website>): Website => r.body)
    );
  }

  /** Path part for operation `getListWebsite()` */
  static readonly GetListWebsitePath = '/Website/GetList';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListWebsite()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListWebsite$Response(params: GetListWebsite$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<Website>>> {
    return getListWebsite(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListWebsite$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListWebsite$Params, context?: HttpContext): Observable<Array<Website>> {
    return this.getListWebsite$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<Website>>): Array<Website> => r.body)
    );
  }

}
