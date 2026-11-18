/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { Comment } from '../models/comment';
import { getListComment } from '../fn/comment/get-list-comment';
import { GetListComment$Params } from '../fn/comment/get-list-comment';
import { syncComment } from '../fn/comment/sync-comment';
import { SyncComment$Params } from '../fn/comment/sync-comment';

@Injectable()
export class CommentService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncComment()` */
  static readonly SyncCommentPath = '/Comment/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncComment()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncComment$Response(params: SyncComment$Params, context?: HttpContext): Observable<StrictHttpResponse<Comment>> {
    return syncComment(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncComment$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncComment$Params, context?: HttpContext): Observable<Comment> {
    return this.syncComment$Response(params, context).pipe(
      map((r: StrictHttpResponse<Comment>): Comment => r.body)
    );
  }

  /** Path part for operation `getListComment()` */
  static readonly GetListCommentPath = '/Comment/GetList';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListComment()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListComment$Response(params: GetListComment$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<Comment>>> {
    return getListComment(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListComment$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListComment$Params, context?: HttpContext): Observable<Array<Comment>> {
    return this.getListComment$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<Comment>>): Array<Comment> => r.body)
    );
  }

}
