/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { messagerGetConversations } from '../fn/messager/messager-get-conversations';
import { MessagerGetConversations$Params } from '../fn/messager/messager-get-conversations';
import { messagerGetMessages } from '../fn/messager/messager-get-messages';
import { MessagerGetMessages$Params } from '../fn/messager/messager-get-messages';
import { messagerListUsers } from '../fn/messager/messager-list-users';
import { MessagerListUsers$Params } from '../fn/messager/messager-list-users';
import { messagerSendMessage } from '../fn/messager/messager-send-message';
import { MessagerSendMessage$Params } from '../fn/messager/messager-send-message';
import { messagerStartConversation } from '../fn/messager/messager-start-conversation';
import { MessagerStartConversation$Params } from '../fn/messager/messager-start-conversation';

@Injectable()
export class MessagerService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `messagerGetConversations()` */
  static readonly MessagerGetConversationsPath = '/Messager/Conversations';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `messagerGetConversations()` instead.
   *
   * This method doesn't expect any request body.
   */
  messagerGetConversations$Response(params?: MessagerGetConversations$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return messagerGetConversations(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `messagerGetConversations$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  messagerGetConversations(params?: MessagerGetConversations$Params, context?: HttpContext): Observable<void> {
    return this.messagerGetConversations$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `messagerStartConversation()` */
  static readonly MessagerStartConversationPath = '/Messager/Conversations';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `messagerStartConversation()` instead.
   *
   * This method doesn't expect any request body.
   */
  messagerStartConversation$Response(params?: MessagerStartConversation$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return messagerStartConversation(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `messagerStartConversation$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  messagerStartConversation(params?: MessagerStartConversation$Params, context?: HttpContext): Observable<void> {
    return this.messagerStartConversation$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `messagerGetMessages()` */
  static readonly MessagerGetMessagesPath = '/Messager/Conversations/{id}/Messages';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `messagerGetMessages()` instead.
   *
   * This method doesn't expect any request body.
   */
  messagerGetMessages$Response(params: MessagerGetMessages$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return messagerGetMessages(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `messagerGetMessages$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  messagerGetMessages(params: MessagerGetMessages$Params, context?: HttpContext): Observable<void> {
    return this.messagerGetMessages$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `messagerSendMessage()` */
  static readonly MessagerSendMessagePath = '/Messager/Conversations/{id}/Messages';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `messagerSendMessage()` instead.
   *
   * This method doesn't expect any request body.
   */
  messagerSendMessage$Response(params: MessagerSendMessage$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return messagerSendMessage(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `messagerSendMessage$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  messagerSendMessage(params: MessagerSendMessage$Params, context?: HttpContext): Observable<void> {
    return this.messagerSendMessage$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `messagerListUsers()` */
  static readonly MessagerListUsersPath = '/Messager/Users';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `messagerListUsers()` instead.
   *
   * This method doesn't expect any request body.
   */
  messagerListUsers$Response(params: MessagerListUsers$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return messagerListUsers(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `messagerListUsers$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  messagerListUsers(params: MessagerListUsers$Params, context?: HttpContext): Observable<void> {
    return this.messagerListUsers$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

}
