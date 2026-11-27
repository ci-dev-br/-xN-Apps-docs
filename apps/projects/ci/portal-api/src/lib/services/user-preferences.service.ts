/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { userPreferencesGetMy } from '../fn/user-preferences/user-preferences-get-my';
import { UserPreferencesGetMy$Params } from '../fn/user-preferences/user-preferences-get-my';
import { userPreferencesSetMy } from '../fn/user-preferences/user-preferences-set-my';
import { UserPreferencesSetMy$Params } from '../fn/user-preferences/user-preferences-set-my';

@Injectable()
export class UserPreferencesService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `userPreferencesGetMy()` */
  static readonly UserPreferencesGetMyPath = '/UserPreferences/My';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `userPreferencesGetMy()` instead.
   *
   * This method doesn't expect any request body.
   */
  userPreferencesGetMy$Response(params?: UserPreferencesGetMy$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return userPreferencesGetMy(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `userPreferencesGetMy$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  userPreferencesGetMy(params?: UserPreferencesGetMy$Params, context?: HttpContext): Observable<void> {
    return this.userPreferencesGetMy$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `userPreferencesSetMy()` */
  static readonly UserPreferencesSetMyPath = '/UserPreferences/My';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `userPreferencesSetMy()` instead.
   *
   * This method doesn't expect any request body.
   */
  userPreferencesSetMy$Response(params?: UserPreferencesSetMy$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return userPreferencesSetMy(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `userPreferencesSetMy$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  userPreferencesSetMy(params?: UserPreferencesSetMy$Params, context?: HttpContext): Observable<void> {
    return this.userPreferencesSetMy$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

}
