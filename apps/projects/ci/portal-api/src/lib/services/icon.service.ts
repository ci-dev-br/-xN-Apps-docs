/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { deleteIcon } from '../fn/icon/delete-icon';
import { DeleteIcon$Params } from '../fn/icon/delete-icon';
import { getByInternalIdIcon } from '../fn/icon/get-by-internal-id-icon';
import { GetByInternalIdIcon$Params } from '../fn/icon/get-by-internal-id-icon';
import { getListIcon } from '../fn/icon/get-list-icon';
import { GetListIcon$Params } from '../fn/icon/get-list-icon';
import { Icon } from '../models/icon';
import { syncIcon } from '../fn/icon/sync-icon';
import { SyncIcon$Params } from '../fn/icon/sync-icon';
import { SyncPayloadDaoIcon } from '../models/sync-payload-dao-icon';

@Injectable()
export class IconService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncIcon()` */
  static readonly SyncIconPath = '/Icon/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncIcon()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncIcon$Response(params: SyncIcon$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDaoIcon>> {
    return syncIcon(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncIcon$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncIcon$Params, context?: HttpContext): Observable<SyncPayloadDaoIcon> {
    return this.syncIcon$Response(params, context).pipe(
      map((r: StrictHttpResponse<SyncPayloadDaoIcon>): SyncPayloadDaoIcon => r.body)
    );
  }

  /** Path part for operation `getByInternalIdIcon()` */
  static readonly GetByInternalIdIconPath = '/Icon/GetByInternalId';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getByInternalIdIcon()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalIdIcon$Response(params: GetByInternalIdIcon$Params, context?: HttpContext): Observable<StrictHttpResponse<Icon>> {
    return getByInternalIdIcon(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getByInternalIdIcon$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalId(params: GetByInternalIdIcon$Params, context?: HttpContext): Observable<Icon> {
    return this.getByInternalIdIcon$Response(params, context).pipe(
      map((r: StrictHttpResponse<Icon>): Icon => r.body)
    );
  }

  /** Path part for operation `getListIcon()` */
  static readonly GetListIconPath = '/Icon/GetList';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListIcon()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListIcon$Response(params: GetListIcon$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDaoIcon>> {
    return getListIcon(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListIcon$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListIcon$Params, context?: HttpContext): Observable<SyncPayloadDaoIcon> {
    return this.getListIcon$Response(params, context).pipe(
      map((r: StrictHttpResponse<SyncPayloadDaoIcon>): SyncPayloadDaoIcon => r.body)
    );
  }

  /** Path part for operation `deleteIcon()` */
  static readonly DeleteIconPath = '/Icon/Delete';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `deleteIcon()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  deleteIcon$Response(params: DeleteIcon$Params, context?: HttpContext): Observable<StrictHttpResponse<Icon>> {
    return deleteIcon(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `deleteIcon$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  delete(params: DeleteIcon$Params, context?: HttpContext): Observable<Icon> {
    return this.deleteIcon$Response(params, context).pipe(
      map((r: StrictHttpResponse<Icon>): Icon => r.body)
    );
  }

}
