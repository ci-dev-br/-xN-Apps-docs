/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { CommentMeta } from '../models/comment-meta';
import { getListCommentMeta } from '../fn/comment-meta/get-list-comment-meta';
import { GetListCommentMeta$Params } from '../fn/comment-meta/get-list-comment-meta';
import { syncCommentMeta } from '../fn/comment-meta/sync-comment-meta';
import { SyncCommentMeta$Params } from '../fn/comment-meta/sync-comment-meta';

@Injectable()
export class CommentMetaService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncCommentMeta()` */
  static readonly SyncCommentMetaPath = '/CommentMeta/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncCommentMeta()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncCommentMeta$Response(params: SyncCommentMeta$Params, context?: HttpContext): Observable<StrictHttpResponse<CommentMeta>> {
    return syncCommentMeta(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncCommentMeta$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncCommentMeta$Params, context?: HttpContext): Observable<CommentMeta> {
    return this.syncCommentMeta$Response(params, context).pipe(
      map((r: StrictHttpResponse<CommentMeta>): CommentMeta => r.body)
    );
  }

  /** Path part for operation `getListCommentMeta()` */
  static readonly GetListCommentMetaPath = '/CommentMeta/GetList';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListCommentMeta()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListCommentMeta$Response(params: GetListCommentMeta$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<CommentMeta>>> {
    return getListCommentMeta(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListCommentMeta$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListCommentMeta$Params, context?: HttpContext): Observable<Array<CommentMeta>> {
    return this.getListCommentMeta$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<CommentMeta>>): Array<CommentMeta> => r.body)
    );
  }

}
