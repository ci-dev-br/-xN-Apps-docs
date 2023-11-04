/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { acessar } from '../fn/auth/acessar';
import { Acessar$Params } from '../fn/auth/acessar';
import { AcessoPayload } from '../models/acesso-payload';
import { AuthorizationOutput } from '../models/authorization-output';
import { logout } from '../fn/auth/logout';
import { Logout$Params } from '../fn/auth/logout';
import { profile } from '../fn/auth/profile';
import { Profile$Params } from '../fn/auth/profile';
import { refresh } from '../fn/auth/refresh';
import { Refresh$Params } from '../fn/auth/refresh';
import { registrar } from '../fn/auth/registrar';
import { Registrar$Params } from '../fn/auth/registrar';
import { User } from '../models/user';

@Injectable({ providedIn: 'root' })
export class AuthService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `registrar()` */
  static readonly RegistrarPath = '/auth/Registrar';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `registrar()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  registrar$Response(params: Registrar$Params, context?: HttpContext): Observable<StrictHttpResponse<User>> {
    return registrar(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `registrar$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  registrar(params: Registrar$Params, context?: HttpContext): Observable<User> {
    return this.registrar$Response(params, context).pipe(
      map((r: StrictHttpResponse<User>): User => r.body)
    );
  }

  /** Path part for operation `profile()` */
  static readonly ProfilePath = '/auth/Profile';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `profile()` instead.
   *
   * This method doesn't expect any request body.
   */
  profile$Response(params?: Profile$Params, context?: HttpContext): Observable<StrictHttpResponse<User>> {
    return profile(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `profile$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  profile(params?: Profile$Params, context?: HttpContext): Observable<User> {
    return this.profile$Response(params, context).pipe(
      map((r: StrictHttpResponse<User>): User => r.body)
    );
  }

  /** Path part for operation `acessar()` */
  static readonly AcessarPath = '/auth/Acessar';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `acessar()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  acessar$Response(params: Acessar$Params, context?: HttpContext): Observable<StrictHttpResponse<AcessoPayload>> {
    return acessar(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `acessar$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  acessar(params: Acessar$Params, context?: HttpContext): Observable<AcessoPayload> {
    return this.acessar$Response(params, context).pipe(
      map((r: StrictHttpResponse<AcessoPayload>): AcessoPayload => r.body)
    );
  }

  /** Path part for operation `logout()` */
  static readonly LogoutPath = '/auth/Logout';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `logout()` instead.
   *
   * This method doesn't expect any request body.
   */
  logout$Response(params?: Logout$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return logout(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `logout$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  logout(params?: Logout$Params, context?: HttpContext): Observable<void> {
    return this.logout$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `refresh()` */
  static readonly RefreshPath = '/auth/Refresh';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `refresh()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  refresh$Response(params: Refresh$Params, context?: HttpContext): Observable<StrictHttpResponse<AuthorizationOutput>> {
    return refresh(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `refresh$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  refresh(params: Refresh$Params, context?: HttpContext): Observable<AuthorizationOutput> {
    return this.refresh$Response(params, context).pipe(
      map((r: StrictHttpResponse<AuthorizationOutput>): AuthorizationOutput => r.body)
    );
  }

}
