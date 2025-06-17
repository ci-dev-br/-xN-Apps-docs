/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { getListUser } from '../fn/user/get-list-user';
import { GetListUser$Params } from '../fn/user/get-list-user';
import { syncUser } from '../fn/user/sync-user';
import { SyncUser$Params } from '../fn/user/sync-user';
import { User } from '../models/user';

@Injectable()
export class UserService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncUser()` */
  static readonly SyncUserPath = '/User/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncUser()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncUser$Response(params: SyncUser$Params, context?: HttpContext): Observable<StrictHttpResponse<User>> {
    return syncUser(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncUser$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncUser$Params, context?: HttpContext): Observable<User> {
    return this.syncUser$Response(params, context).pipe(
      map((r: StrictHttpResponse<User>): User => r.body)
    );
  }

  /** Path part for operation `getListUser()` */
  static readonly GetListUserPath = '/User/GetList';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListUser()` instead.
   *
   * This method doesn't expect any request body.
   */
  getListUser$Response(params?: GetListUser$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<User>>> {
    return getListUser(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListUser$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getList(params?: GetListUser$Params, context?: HttpContext): Observable<Array<User>> {
    return this.getListUser$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<User>>): Array<User> => r.body)
    );
  }

}
