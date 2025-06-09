/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { getListLinks } from '../fn/links/get-list-links';
import { GetListLinks$Params } from '../fn/links/get-list-links';
import { Links } from '../models/links';
import { syncLinks } from '../fn/links/sync-links';
import { SyncLinks$Params } from '../fn/links/sync-links';

@Injectable()
export class LinksService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncLinks()` */
  static readonly SyncLinksPath = '/Links/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncLinks()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncLinks$Response(params: SyncLinks$Params, context?: HttpContext): Observable<StrictHttpResponse<Links>> {
    return syncLinks(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncLinks$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncLinks$Params, context?: HttpContext): Observable<Links> {
    return this.syncLinks$Response(params, context).pipe(
      map((r: StrictHttpResponse<Links>): Links => r.body)
    );
  }

  /** Path part for operation `getListLinks()` */
  static readonly GetListLinksPath = '/Links/GetList';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListLinks()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListLinks$Response(params: GetListLinks$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<Links>>> {
    return getListLinks(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListLinks$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListLinks$Params, context?: HttpContext): Observable<Array<Links>> {
    return this.getListLinks$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<Links>>): Array<Links> => r.body)
    );
  }

}
