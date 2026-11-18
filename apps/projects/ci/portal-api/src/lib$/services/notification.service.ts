/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { notificationGetMy } from '../fn/notification/notification-get-my';
import { NotificationGetMy$Params } from '../fn/notification/notification-get-my';
import { notificationMarkAllAsRead } from '../fn/notification/notification-mark-all-as-read';
import { NotificationMarkAllAsRead$Params } from '../fn/notification/notification-mark-all-as-read';
import { notificationMarkAsRead } from '../fn/notification/notification-mark-as-read';
import { NotificationMarkAsRead$Params } from '../fn/notification/notification-mark-as-read';
import { notificationPushSubscribe } from '../fn/notification/notification-push-subscribe';
import { NotificationPushSubscribe$Params } from '../fn/notification/notification-push-subscribe';
import { notificationSendTest } from '../fn/notification/notification-send-test';
import { NotificationSendTest$Params } from '../fn/notification/notification-send-test';

@Injectable()
export class NotificationService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `notificationGetMy()` */
  static readonly NotificationGetMyPath = '/Notification/My';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `notificationGetMy()` instead.
   *
   * This method doesn't expect any request body.
   */
  notificationGetMy$Response(params?: NotificationGetMy$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return notificationGetMy(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `notificationGetMy$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  notificationGetMy(params?: NotificationGetMy$Params, context?: HttpContext): Observable<void> {
    return this.notificationGetMy$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `notificationMarkAsRead()` */
  static readonly NotificationMarkAsReadPath = '/Notification/{id}/Read';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `notificationMarkAsRead()` instead.
   *
   * This method doesn't expect any request body.
   */
  notificationMarkAsRead$Response(params: NotificationMarkAsRead$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return notificationMarkAsRead(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `notificationMarkAsRead$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  notificationMarkAsRead(params: NotificationMarkAsRead$Params, context?: HttpContext): Observable<void> {
    return this.notificationMarkAsRead$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `notificationMarkAllAsRead()` */
  static readonly NotificationMarkAllAsReadPath = '/Notification/ReadAll';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `notificationMarkAllAsRead()` instead.
   *
   * This method doesn't expect any request body.
   */
  notificationMarkAllAsRead$Response(params?: NotificationMarkAllAsRead$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return notificationMarkAllAsRead(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `notificationMarkAllAsRead$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  notificationMarkAllAsRead(params?: NotificationMarkAllAsRead$Params, context?: HttpContext): Observable<void> {
    return this.notificationMarkAllAsRead$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `notificationPushSubscribe()` */
  static readonly NotificationPushSubscribePath = '/Notification/Push/Subscribe';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `notificationPushSubscribe()` instead.
   *
   * This method doesn't expect any request body.
   */
  notificationPushSubscribe$Response(params?: NotificationPushSubscribe$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return notificationPushSubscribe(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `notificationPushSubscribe$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  notificationPushSubscribe(params?: NotificationPushSubscribe$Params, context?: HttpContext): Observable<void> {
    return this.notificationPushSubscribe$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `notificationSendTest()` */
  static readonly NotificationSendTestPath = '/Notification/Test';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `notificationSendTest()` instead.
   *
   * This method doesn't expect any request body.
   */
  notificationSendTest$Response(params?: NotificationSendTest$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return notificationSendTest(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `notificationSendTest$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  notificationSendTest(params?: NotificationSendTest$Params, context?: HttpContext): Observable<void> {
    return this.notificationSendTest$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

}
