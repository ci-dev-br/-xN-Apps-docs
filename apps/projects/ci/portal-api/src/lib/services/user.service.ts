/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { addUserToTenant } from '../fn/user/add-user-to-tenant';
import { AddUserToTenant$Params } from '../fn/user/add-user-to-tenant';
import { getListUser } from '../fn/user/get-list-user';
import { GetListUser$Params } from '../fn/user/get-list-user';
import { removeUserFromTenant } from '../fn/user/remove-user-from-tenant';
import { RemoveUserFromTenant$Params } from '../fn/user/remove-user-from-tenant';
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
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListUser$Response(params?: GetListUser$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<User>>> {
    return getListUser(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListUser$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params?: GetListUser$Params, context?: HttpContext): Observable<Array<User>> {
    return this.getListUser$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<User>>): Array<User> => r.body)
    );
  }

  /** Path part for operation `addUserToTenant()` */
  static readonly AddUserToTenantPath = '/User/AddToTenant';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `addUserToTenant()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  addUserToTenant$Response(params: AddUserToTenant$Params, context?: HttpContext): Observable<StrictHttpResponse<User>> {
    return addUserToTenant(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `addUserToTenant$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  addToTenant(params: AddUserToTenant$Params, context?: HttpContext): Observable<User> {
    return this.addUserToTenant$Response(params, context).pipe(
      map((r: StrictHttpResponse<User>): User => r.body)
    );
  }

  /** Path part for operation `removeUserFromTenant()` */
  static readonly RemoveUserFromTenantPath = '/User/RemoveFromTenant';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `removeUserFromTenant()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  removeUserFromTenant$Response(params: RemoveUserFromTenant$Params, context?: HttpContext): Observable<StrictHttpResponse<User>> {
    return removeUserFromTenant(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `removeUserFromTenant$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  removeFromTenant(params: RemoveUserFromTenant$Params, context?: HttpContext): Observable<User> {
    return this.removeUserFromTenant$Response(params, context).pipe(
      map((r: StrictHttpResponse<User>): User => r.body)
    );
  }

}
