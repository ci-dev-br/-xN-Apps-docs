/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { Conversation } from '../models/conversation';
import { getListConversation } from '../fn/conversation/get-list-conversation';
import { GetListConversation$Params } from '../fn/conversation/get-list-conversation';
import { logConversation } from '../fn/conversation/log-conversation';
import { LogConversation$Params } from '../fn/conversation/log-conversation';
import { syncConversation } from '../fn/conversation/sync-conversation';
import { SyncConversation$Params } from '../fn/conversation/sync-conversation';

@Injectable()
export class ConversationService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `getListConversation()` */
  static readonly GetListConversationPath = '/Conversation/GetListConversation';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListConversation()` instead.
   *
   * This method doesn't expect any request body.
   */
  getListConversation$Response(params?: GetListConversation$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<Conversation>>> {
    return getListConversation(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListConversation$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getList(params?: GetListConversation$Params, context?: HttpContext): Observable<Array<Conversation>> {
    return this.getListConversation$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<Conversation>>): Array<Conversation> => r.body)
    );
  }

  /** Path part for operation `syncConversation()` */
  static readonly SyncConversationPath = '/Conversation/SyncConversation';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncConversation()` instead.
   *
   * This method doesn't expect any request body.
   */
  syncConversation$Response(params?: SyncConversation$Params, context?: HttpContext): Observable<StrictHttpResponse<Conversation>> {
    return syncConversation(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncConversation$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  sync(params?: SyncConversation$Params, context?: HttpContext): Observable<Conversation> {
    return this.syncConversation$Response(params, context).pipe(
      map((r: StrictHttpResponse<Conversation>): Conversation => r.body)
    );
  }

  /** Path part for operation `logConversation()` */
  static readonly LogConversationPath = '/Conversation/LogConversation';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `logConversation()` instead.
   *
   * This method doesn't expect any request body.
   */
  logConversation$Response(params?: LogConversation$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return logConversation(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `logConversation$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  log(params?: LogConversation$Params, context?: HttpContext): Observable<void> {
    return this.logConversation$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

}
