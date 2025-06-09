/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { getListTermMeta } from '../fn/term-meta/get-list-term-meta';
import { GetListTermMeta$Params } from '../fn/term-meta/get-list-term-meta';
import { syncTermMeta } from '../fn/term-meta/sync-term-meta';
import { SyncTermMeta$Params } from '../fn/term-meta/sync-term-meta';
import { TermMeta } from '../models/term-meta';

@Injectable()
export class TermMetaService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncTermMeta()` */
  static readonly SyncTermMetaPath = '/TermMeta/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncTermMeta()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncTermMeta$Response(params: SyncTermMeta$Params, context?: HttpContext): Observable<StrictHttpResponse<TermMeta>> {
    return syncTermMeta(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncTermMeta$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncTermMeta$Params, context?: HttpContext): Observable<TermMeta> {
    return this.syncTermMeta$Response(params, context).pipe(
      map((r: StrictHttpResponse<TermMeta>): TermMeta => r.body)
    );
  }

  /** Path part for operation `getListTermMeta()` */
  static readonly GetListTermMetaPath = '/TermMeta/GetList';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListTermMeta()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListTermMeta$Response(params: GetListTermMeta$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<TermMeta>>> {
    return getListTermMeta(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListTermMeta$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListTermMeta$Params, context?: HttpContext): Observable<Array<TermMeta>> {
    return this.getListTermMeta$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<TermMeta>>): Array<TermMeta> => r.body)
    );
  }

}
