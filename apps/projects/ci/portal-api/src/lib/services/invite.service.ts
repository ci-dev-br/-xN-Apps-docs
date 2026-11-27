/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { getInvite } from '../fn/invite/get-invite';
import { GetInvite$Params } from '../fn/invite/get-invite';
import { getListInvite } from '../fn/invite/get-list-invite';
import { GetListInvite$Params } from '../fn/invite/get-list-invite';
import { Invite } from '../models/invite';
import { sendInvitation } from '../fn/invite/send-invitation';
import { SendInvitation$Params } from '../fn/invite/send-invitation';
import { syncInvite } from '../fn/invite/sync-invite';
import { SyncInvite$Params } from '../fn/invite/sync-invite';

@Injectable()
export class InviteService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `sendInvitation()` */
  static readonly SendInvitationPath = '/Invite/SendInvitation';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `sendInvitation()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sendInvitation$Response(params: SendInvitation$Params, context?: HttpContext): Observable<StrictHttpResponse<Invite>> {
    return sendInvitation(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `sendInvitation$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sendInvitation(params: SendInvitation$Params, context?: HttpContext): Observable<Invite> {
    return this.sendInvitation$Response(params, context).pipe(
      map((r: StrictHttpResponse<Invite>): Invite => r.body)
    );
  }

  /** Path part for operation `syncInvite()` */
  static readonly SyncInvitePath = '/Invite/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncInvite()` instead.
   *
   * This method doesn't expect any request body.
   */
  syncInvite$Response(params?: SyncInvite$Params, context?: HttpContext): Observable<StrictHttpResponse<Invite>> {
    return syncInvite(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncInvite$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  sync(params?: SyncInvite$Params, context?: HttpContext): Observable<Invite> {
    return this.syncInvite$Response(params, context).pipe(
      map((r: StrictHttpResponse<Invite>): Invite => r.body)
    );
  }

  /** Path part for operation `getListInvite()` */
  static readonly GetListInvitePath = '/Invite/Get';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListInvite()` instead.
   *
   * This method doesn't expect any request body.
   */
  getListInvite$Response(params?: GetListInvite$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<Invite>>> {
    return getListInvite(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListInvite$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getList(params?: GetListInvite$Params, context?: HttpContext): Observable<Array<Invite>> {
    return this.getListInvite$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<Invite>>): Array<Invite> => r.body)
    );
  }

  /** Path part for operation `getInvite()` */
  static readonly GetInvitePath = '/Invite/GetInvite';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getInvite()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getInvite$Response(params?: GetInvite$Params, context?: HttpContext): Observable<StrictHttpResponse<Invite>> {
    return getInvite(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getInvite$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  get(params?: GetInvite$Params, context?: HttpContext): Observable<Invite> {
    return this.getInvite$Response(params, context).pipe(
      map((r: StrictHttpResponse<Invite>): Invite => r.body)
    );
  }

}
