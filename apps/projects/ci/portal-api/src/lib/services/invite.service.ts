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
import { sendInvitation } from '../fn/invite/send-invitation';
import { SendInvitation$Params } from '../fn/invite/send-invitation';

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
  sendInvitation$Response(params: SendInvitation$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return sendInvitation(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `sendInvitation$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sendInvitation(params: SendInvitation$Params, context?: HttpContext): Observable<void> {
    return this.sendInvitation$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
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
  getInvite$Response(params: GetInvite$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return getInvite(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getInvite$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  get(params: GetInvite$Params, context?: HttpContext): Observable<void> {
    return this.getInvite$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

}
