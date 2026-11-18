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
import { requestRegisterByFistContact } from '../fn/register/request-register-by-fist-contact';
import { RequestRegisterByFistContact$Params } from '../fn/register/request-register-by-fist-contact';

@Injectable()
export class RegisterService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `requestRegisterByFistContact()` */
  static readonly RequestRegisterByFistContactPath = '/Register/RequestRegisterByFistContact';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `requestRegisterByFistContact()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  requestRegisterByFistContact$Response(params: RequestRegisterByFistContact$Params, context?: HttpContext): Observable<StrictHttpResponse<Register>> {
    return requestRegisterByFistContact(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `requestRegisterByFistContact$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  requestByFistContact(params: RequestRegisterByFistContact$Params, context?: HttpContext): Observable<Register> {
    return this.requestRegisterByFistContact$Response(params, context).pipe(
      map((r: StrictHttpResponse<Register>): Register => r.body)
    );
  }

}
