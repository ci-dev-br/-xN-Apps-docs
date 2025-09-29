/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { Register } from '../models/register';
import { registrarAuth_1 } from '../fn/register/registrar-auth-1';
import { RegistrarAuth_1$Params } from '../fn/register/registrar-auth-1';

@Injectable()
export class RegisterService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `registrarAuth_1()` */
  static readonly RegistrarAuth_1Path = '/Register/requestRegisterByFistContact';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `registrarAuth_1()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  registrarAuth_1$Response(params: RegistrarAuth_1$Params, context?: HttpContext): Observable<StrictHttpResponse<Register>> {
    return registrarAuth_1(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `registrarAuth_1$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  registrarAuth_1(params: RegistrarAuth_1$Params, context?: HttpContext): Observable<Register> {
    return this.registrarAuth_1$Response(params, context).pipe(
      map((r: StrictHttpResponse<Register>): Register => r.body)
    );
  }

}
