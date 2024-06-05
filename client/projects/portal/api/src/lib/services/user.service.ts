/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { syncUser } from '../fn/user/sync-user';
import { SyncUser$Params } from '../fn/user/sync-user';
import { User } from '../models/user';
import { userGetList } from '../fn/user/user-get-list';
import { UserGetList$Params } from '../fn/user/user-get-list';

@Injectable({ providedIn: 'root' })
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
  syncUser(params: SyncUser$Params, context?: HttpContext): Observable<User> {
    return this.syncUser$Response(params, context).pipe(
      map((r: StrictHttpResponse<User>): User => r.body)
    );
  }

  /** Path part for operation `userGetList()` */
  static readonly UserGetListPath = '/User/GetList';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `userGetList()` instead.
   *
   * This method doesn't expect any request body.
   */
  userGetList$Response(params?: UserGetList$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<User>>> {
    return userGetList(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `userGetList$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  userGetList(params?: UserGetList$Params, context?: HttpContext): Observable<Array<User>> {
    return this.userGetList$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<User>>): Array<User> => r.body)
    );
  }

}
