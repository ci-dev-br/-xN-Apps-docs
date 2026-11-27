/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { deleteIconPack } from '../fn/icon-pack/delete-icon-pack';
import { DeleteIconPack$Params } from '../fn/icon-pack/delete-icon-pack';
import { getByInternalIdIconPack } from '../fn/icon-pack/get-by-internal-id-icon-pack';
import { GetByInternalIdIconPack$Params } from '../fn/icon-pack/get-by-internal-id-icon-pack';
import { getListIconPack } from '../fn/icon-pack/get-list-icon-pack';
import { GetListIconPack$Params } from '../fn/icon-pack/get-list-icon-pack';
import { IconPack } from '../models/icon-pack';
import { syncIconPack } from '../fn/icon-pack/sync-icon-pack';
import { SyncIconPack$Params } from '../fn/icon-pack/sync-icon-pack';
import { SyncPayloadDaoIconPack } from '../models/sync-payload-dao-icon-pack';

@Injectable()
export class IconPackService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncIconPack()` */
  static readonly SyncIconPackPath = '/IconPack/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncIconPack()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncIconPack$Response(params: SyncIconPack$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDaoIconPack>> {
    return syncIconPack(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncIconPack$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncIconPack$Params, context?: HttpContext): Observable<SyncPayloadDaoIconPack> {
    return this.syncIconPack$Response(params, context).pipe(
      map((r: StrictHttpResponse<SyncPayloadDaoIconPack>): SyncPayloadDaoIconPack => r.body)
    );
  }

  /** Path part for operation `getByInternalIdIconPack()` */
  static readonly GetByInternalIdIconPackPath = '/IconPack/GetByInternalId';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getByInternalIdIconPack()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalIdIconPack$Response(params: GetByInternalIdIconPack$Params, context?: HttpContext): Observable<StrictHttpResponse<IconPack>> {
    return getByInternalIdIconPack(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getByInternalIdIconPack$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalId(params: GetByInternalIdIconPack$Params, context?: HttpContext): Observable<IconPack> {
    return this.getByInternalIdIconPack$Response(params, context).pipe(
      map((r: StrictHttpResponse<IconPack>): IconPack => r.body)
    );
  }

  /** Path part for operation `getListIconPack()` */
  static readonly GetListIconPackPath = '/IconPack/GetList';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListIconPack()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListIconPack$Response(params: GetListIconPack$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDaoIconPack>> {
    return getListIconPack(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListIconPack$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListIconPack$Params, context?: HttpContext): Observable<SyncPayloadDaoIconPack> {
    return this.getListIconPack$Response(params, context).pipe(
      map((r: StrictHttpResponse<SyncPayloadDaoIconPack>): SyncPayloadDaoIconPack => r.body)
    );
  }

  /** Path part for operation `deleteIconPack()` */
  static readonly DeleteIconPackPath = '/IconPack/Delete';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `deleteIconPack()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  deleteIconPack$Response(params: DeleteIconPack$Params, context?: HttpContext): Observable<StrictHttpResponse<IconPack>> {
    return deleteIconPack(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `deleteIconPack$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  delete(params: DeleteIconPack$Params, context?: HttpContext): Observable<IconPack> {
    return this.deleteIconPack$Response(params, context).pipe(
      map((r: StrictHttpResponse<IconPack>): IconPack => r.body)
    );
  }

}
