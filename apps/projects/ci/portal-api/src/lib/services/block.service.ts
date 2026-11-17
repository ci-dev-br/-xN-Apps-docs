/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { Block } from '../models/block';
import { deleteBlock } from '../fn/block/delete-block';
import { DeleteBlock$Params } from '../fn/block/delete-block';
import { getByInternalIdBlock } from '../fn/block/get-by-internal-id-block';
import { GetByInternalIdBlock$Params } from '../fn/block/get-by-internal-id-block';
import { getListBlock } from '../fn/block/get-list-block';
import { GetListBlock$Params } from '../fn/block/get-list-block';
import { syncBlock } from '../fn/block/sync-block';
import { SyncBlock$Params } from '../fn/block/sync-block';
import { SyncPayloadDaoBlock } from '../models/sync-payload-dao-block';

@Injectable()
export class BlockService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncBlock()` */
  static readonly SyncBlockPath = '/Block/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncBlock()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncBlock$Response(params: SyncBlock$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDaoBlock>> {
    return syncBlock(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncBlock$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncBlock$Params, context?: HttpContext): Observable<SyncPayloadDaoBlock> {
    return this.syncBlock$Response(params, context).pipe(
      map((r: StrictHttpResponse<SyncPayloadDaoBlock>): SyncPayloadDaoBlock => r.body)
    );
  }

  /** Path part for operation `getByInternalIdBlock()` */
  static readonly GetByInternalIdBlockPath = '/Block/GetByInternalId';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getByInternalIdBlock()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalIdBlock$Response(params: GetByInternalIdBlock$Params, context?: HttpContext): Observable<StrictHttpResponse<Block>> {
    return getByInternalIdBlock(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getByInternalIdBlock$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalId(params: GetByInternalIdBlock$Params, context?: HttpContext): Observable<Block> {
    return this.getByInternalIdBlock$Response(params, context).pipe(
      map((r: StrictHttpResponse<Block>): Block => r.body)
    );
  }

  /** Path part for operation `getListBlock()` */
  static readonly GetListBlockPath = '/Block/GetList';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListBlock()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListBlock$Response(params: GetListBlock$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDaoBlock>> {
    return getListBlock(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListBlock$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListBlock$Params, context?: HttpContext): Observable<SyncPayloadDaoBlock> {
    return this.getListBlock$Response(params, context).pipe(
      map((r: StrictHttpResponse<SyncPayloadDaoBlock>): SyncPayloadDaoBlock => r.body)
    );
  }

  /** Path part for operation `deleteBlock()` */
  static readonly DeleteBlockPath = '/Block/Delete';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `deleteBlock()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  deleteBlock$Response(params: DeleteBlock$Params, context?: HttpContext): Observable<StrictHttpResponse<Block>> {
    return deleteBlock(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `deleteBlock$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  delete(params: DeleteBlock$Params, context?: HttpContext): Observable<Block> {
    return this.deleteBlock$Response(params, context).pipe(
      map((r: StrictHttpResponse<Block>): Block => r.body)
    );
  }

}
