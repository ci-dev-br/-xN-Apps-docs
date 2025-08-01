/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { getListWorkItem } from '../fn/work-item/get-list-work-item';
import { GetListWorkItem$Params } from '../fn/work-item/get-list-work-item';
import { SyncPayloadDaoWorkItem } from '../models/sync-payload-dao-work-item';
import { syncWorkItem } from '../fn/work-item/sync-work-item';
import { SyncWorkItem$Params } from '../fn/work-item/sync-work-item';

@Injectable()
export class WorkItemService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncWorkItem()` */
  static readonly SyncWorkItemPath = '/WorkItem/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncWorkItem()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncWorkItem$Response(params: SyncWorkItem$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDaoWorkItem>> {
    return syncWorkItem(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncWorkItem$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncWorkItem$Params, context?: HttpContext): Observable<SyncPayloadDaoWorkItem> {
    return this.syncWorkItem$Response(params, context).pipe(
      map((r: StrictHttpResponse<SyncPayloadDaoWorkItem>): SyncPayloadDaoWorkItem => r.body)
    );
  }

  /** Path part for operation `getListWorkItem()` */
  static readonly GetListWorkItemPath = '/WorkItem/GetList';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListWorkItem()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListWorkItem$Response(params: GetListWorkItem$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDaoWorkItem>> {
    return getListWorkItem(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListWorkItem$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListWorkItem$Params, context?: HttpContext): Observable<SyncPayloadDaoWorkItem> {
    return this.getListWorkItem$Response(params, context).pipe(
      map((r: StrictHttpResponse<SyncPayloadDaoWorkItem>): SyncPayloadDaoWorkItem => r.body)
    );
  }

}
