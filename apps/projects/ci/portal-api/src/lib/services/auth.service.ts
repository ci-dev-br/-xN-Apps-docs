/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { acessarAuth } from '../fn/auth/acessar-auth';
import { AcessarAuth$Params } from '../fn/auth/acessar-auth';
import { AcessoPayload } from '../models/acesso-payload';
import { AuthorizationOutput } from '../models/authorization-output';
import { confirmarEmailAuth } from '../fn/auth/confirmar-email-auth';
import { ConfirmarEmailAuth$Params } from '../fn/auth/confirmar-email-auth';
import { ConfirmarEmailOutputDto } from '../models/confirmar-email-output-dto';
import { desconectarDispositivoAuth } from '../fn/auth/desconectar-dispositivo-auth';
import { DesconectarDispositivoAuth$Params } from '../fn/auth/desconectar-dispositivo-auth';
import { desconectarOutrosDispositivosAuth } from '../fn/auth/desconectar-outros-dispositivos-auth';
import { DesconectarOutrosDispositivosAuth$Params } from '../fn/auth/desconectar-outros-dispositivos-auth';
import { getDispositivosAuth } from '../fn/auth/get-dispositivos-auth';
import { GetDispositivosAuth$Params } from '../fn/auth/get-dispositivos-auth';
import { logoutAuth } from '../fn/auth/logout-auth';
import { LogoutAuth$Params } from '../fn/auth/logout-auth';
import { profileAuth } from '../fn/auth/profile-auth';
import { ProfileAuth$Params } from '../fn/auth/profile-auth';
import { refreshAuth } from '../fn/auth/refresh-auth';
import { RefreshAuth$Params } from '../fn/auth/refresh-auth';
import { registrarAuth } from '../fn/auth/registrar-auth';
import { RegistrarAuth$Params } from '../fn/auth/registrar-auth';
import { solicitarVerificacaoEmailAuth } from '../fn/auth/solicitar-verificacao-email-auth';
import { SolicitarVerificacaoEmailAuth$Params } from '../fn/auth/solicitar-verificacao-email-auth';
import { SolicitarVerificacaoEmailOutputDto } from '../models/solicitar-verificacao-email-output-dto';
import { User } from '../models/user';

@Injectable()
export class AuthService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `registrarAuth()` */
  static readonly RegistrarAuthPath = '/auth/Registrar';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `registrarAuth()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  registrarAuth$Response(params: RegistrarAuth$Params, context?: HttpContext): Observable<StrictHttpResponse<User>> {
    return registrarAuth(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `registrarAuth$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  registrar(params: RegistrarAuth$Params, context?: HttpContext): Observable<User> {
    return this.registrarAuth$Response(params, context).pipe(
      map((r: StrictHttpResponse<User>): User => r.body)
    );
  }

  /** Path part for operation `profileAuth()` */
  static readonly ProfileAuthPath = '/auth/Profile';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `profileAuth()` instead.
   *
   * This method doesn't expect any request body.
   */
  profileAuth$Response(params?: ProfileAuth$Params, context?: HttpContext): Observable<StrictHttpResponse<User>> {
    return profileAuth(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `profileAuth$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  profile(params?: ProfileAuth$Params, context?: HttpContext): Observable<User> {
    return this.profileAuth$Response(params, context).pipe(
      map((r: StrictHttpResponse<User>): User => r.body)
    );
  }

  /** Path part for operation `solicitarVerificacaoEmailAuth()` */
  static readonly SolicitarVerificacaoEmailAuthPath = '/auth/SolicitarVerificacaoEmail';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `solicitarVerificacaoEmailAuth()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  solicitarVerificacaoEmailAuth$Response(params: SolicitarVerificacaoEmailAuth$Params, context?: HttpContext): Observable<StrictHttpResponse<SolicitarVerificacaoEmailOutputDto>> {
    return solicitarVerificacaoEmailAuth(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `solicitarVerificacaoEmailAuth$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  solicitarVerificacaoEmail(params: SolicitarVerificacaoEmailAuth$Params, context?: HttpContext): Observable<SolicitarVerificacaoEmailOutputDto> {
    return this.solicitarVerificacaoEmailAuth$Response(params, context).pipe(
      map((r: StrictHttpResponse<SolicitarVerificacaoEmailOutputDto>): SolicitarVerificacaoEmailOutputDto => r.body)
    );
  }

  /** Path part for operation `confirmarEmailAuth()` */
  static readonly ConfirmarEmailAuthPath = '/auth/ConfirmarEmail';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `confirmarEmailAuth()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  confirmarEmailAuth$Response(params: ConfirmarEmailAuth$Params, context?: HttpContext): Observable<StrictHttpResponse<ConfirmarEmailOutputDto>> {
    return confirmarEmailAuth(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `confirmarEmailAuth$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  confirmarEmail(params: ConfirmarEmailAuth$Params, context?: HttpContext): Observable<ConfirmarEmailOutputDto> {
    return this.confirmarEmailAuth$Response(params, context).pipe(
      map((r: StrictHttpResponse<ConfirmarEmailOutputDto>): ConfirmarEmailOutputDto => r.body)
    );
  }

  /** Path part for operation `acessarAuth()` */
  static readonly AcessarAuthPath = '/auth/Acessar';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `acessarAuth()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  acessarAuth$Response(params: AcessarAuth$Params, context?: HttpContext): Observable<StrictHttpResponse<AcessoPayload>> {
    return acessarAuth(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `acessarAuth$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  acessar(params: AcessarAuth$Params, context?: HttpContext): Observable<AcessoPayload> {
    return this.acessarAuth$Response(params, context).pipe(
      map((r: StrictHttpResponse<AcessoPayload>): AcessoPayload => r.body)
    );
  }

  /** Path part for operation `getDispositivosAuth()` */
  static readonly GetDispositivosAuthPath = '/auth/Dispositivos';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getDispositivosAuth()` instead.
   *
   * This method doesn't expect any request body.
   */
  getDispositivosAuth$Response(params?: GetDispositivosAuth$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return getDispositivosAuth(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getDispositivosAuth$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getDispositivos(params?: GetDispositivosAuth$Params, context?: HttpContext): Observable<void> {
    return this.getDispositivosAuth$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `desconectarDispositivoAuth()` */
  static readonly DesconectarDispositivoAuthPath = '/auth/DesconectarDispositivo';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `desconectarDispositivoAuth()` instead.
   *
   * This method doesn't expect any request body.
   */
  desconectarDispositivoAuth$Response(params?: DesconectarDispositivoAuth$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return desconectarDispositivoAuth(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `desconectarDispositivoAuth$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  desconectarDispositivo(params?: DesconectarDispositivoAuth$Params, context?: HttpContext): Observable<void> {
    return this.desconectarDispositivoAuth$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `desconectarOutrosDispositivosAuth()` */
  static readonly DesconectarOutrosDispositivosAuthPath = '/auth/DesconectarOutrosDispositivos';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `desconectarOutrosDispositivosAuth()` instead.
   *
   * This method doesn't expect any request body.
   */
  desconectarOutrosDispositivosAuth$Response(params?: DesconectarOutrosDispositivosAuth$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return desconectarOutrosDispositivosAuth(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `desconectarOutrosDispositivosAuth$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  desconectarOutrosDispositivos(params?: DesconectarOutrosDispositivosAuth$Params, context?: HttpContext): Observable<void> {
    return this.desconectarOutrosDispositivosAuth$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `logoutAuth()` */
  static readonly LogoutAuthPath = '/auth/Logout';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `logoutAuth()` instead.
   *
   * This method doesn't expect any request body.
   */
  logoutAuth$Response(params?: LogoutAuth$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return logoutAuth(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `logoutAuth$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  logout(params?: LogoutAuth$Params, context?: HttpContext): Observable<void> {
    return this.logoutAuth$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `refreshAuth()` */
  static readonly RefreshAuthPath = '/auth/Refresh';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `refreshAuth()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  refreshAuth$Response(params: RefreshAuth$Params, context?: HttpContext): Observable<StrictHttpResponse<AuthorizationOutput>> {
    return refreshAuth(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `refreshAuth$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  refresh(params: RefreshAuth$Params, context?: HttpContext): Observable<AuthorizationOutput> {
    return this.refreshAuth$Response(params, context).pipe(
      map((r: StrictHttpResponse<AuthorizationOutput>): AuthorizationOutput => r.body)
    );
  }

}
