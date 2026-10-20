/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { socialConexoesDe } from '../fn/social/social-conexoes-de';
import { SocialConexoesDe$Params } from '../fn/social/social-conexoes-de';
import { socialFollow } from '../fn/social/social-follow';
import { SocialFollow$Params } from '../fn/social/social-follow';
import { socialMinhasConexoes } from '../fn/social/social-minhas-conexoes';
import { SocialMinhasConexoes$Params } from '../fn/social/social-minhas-conexoes';
import { socialStatus } from '../fn/social/social-status';
import { SocialStatus$Params } from '../fn/social/social-status';
import { socialUnfollow } from '../fn/social/social-unfollow';
import { SocialUnfollow$Params } from '../fn/social/social-unfollow';
import { VinculoSocial } from '../models/vinculo-social';

@Injectable()
export class SocialService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `socialFollow()` */
  static readonly SocialFollowPath = '/Social/Follow/{userId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `socialFollow()` instead.
   *
   * This method doesn't expect any request body.
   */
  socialFollow$Response(params: SocialFollow$Params, context?: HttpContext): Observable<StrictHttpResponse<VinculoSocial>> {
    return socialFollow(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `socialFollow$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  socialFollow(params: SocialFollow$Params, context?: HttpContext): Observable<VinculoSocial> {
    return this.socialFollow$Response(params, context).pipe(
      map((r: StrictHttpResponse<VinculoSocial>): VinculoSocial => r.body)
    );
  }

  /** Path part for operation `socialUnfollow()` */
  static readonly SocialUnfollowPath = '/Social/Unfollow/{userId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `socialUnfollow()` instead.
   *
   * This method doesn't expect any request body.
   */
  socialUnfollow$Response(params: SocialUnfollow$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return socialUnfollow(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `socialUnfollow$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  socialUnfollow(params: SocialUnfollow$Params, context?: HttpContext): Observable<void> {
    return this.socialUnfollow$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `socialStatus()` */
  static readonly SocialStatusPath = '/Social/Status/{userId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `socialStatus()` instead.
   *
   * This method doesn't expect any request body.
   */
  socialStatus$Response(params: SocialStatus$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return socialStatus(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `socialStatus$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  socialStatus(params: SocialStatus$Params, context?: HttpContext): Observable<void> {
    return this.socialStatus$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `socialMinhasConexoes()` */
  static readonly SocialMinhasConexoesPath = '/Social/Conexoes';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `socialMinhasConexoes()` instead.
   *
   * This method doesn't expect any request body.
   */
  socialMinhasConexoes$Response(params?: SocialMinhasConexoes$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return socialMinhasConexoes(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `socialMinhasConexoes$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  socialMinhasConexoes(params?: SocialMinhasConexoes$Params, context?: HttpContext): Observable<void> {
    return this.socialMinhasConexoes$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `socialConexoesDe()` */
  static readonly SocialConexoesDePath = '/Social/Conexoes/{userId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `socialConexoesDe()` instead.
   *
   * This method doesn't expect any request body.
   */
  socialConexoesDe$Response(params: SocialConexoesDe$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return socialConexoesDe(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `socialConexoesDe$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  socialConexoesDe(params: SocialConexoesDe$Params, context?: HttpContext): Observable<void> {
    return this.socialConexoesDe$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

}
