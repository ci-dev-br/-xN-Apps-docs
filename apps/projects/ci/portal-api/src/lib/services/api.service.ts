/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { appControllerHandleAllRequests } from '../fn/operations/app-controller-handle-all-requests';
import { appControllerHandleAllRequests_1 } from '../fn/operations/app-controller-handle-all-requests-1';
import { AppControllerHandleAllRequests_1$Params } from '../fn/operations/app-controller-handle-all-requests-1';
import { AppControllerHandleAllRequests$Params } from '../fn/operations/app-controller-handle-all-requests';

@Injectable()
export class ApiService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `appControllerHandleAllRequests()` */
  static readonly AppControllerHandleAllRequestsPath = '/';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `appControllerHandleAllRequests()` instead.
   *
   * This method doesn't expect any request body.
   */
  appControllerHandleAllRequests$Response(params?: AppControllerHandleAllRequests$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return appControllerHandleAllRequests(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `appControllerHandleAllRequests$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  appControllerHandleAllRequests(params?: AppControllerHandleAllRequests$Params, context?: HttpContext): Observable<void> {
    return this.appControllerHandleAllRequests$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `appControllerHandleAllRequests_1()` */
  static readonly AppControllerHandleAllRequests_1Path = '/*w';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `appControllerHandleAllRequests_1()` instead.
   *
   * This method doesn't expect any request body.
   */
  appControllerHandleAllRequests_1$Response(params?: AppControllerHandleAllRequests_1$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return appControllerHandleAllRequests_1(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `appControllerHandleAllRequests_1$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  appControllerHandleAllRequests_1(params?: AppControllerHandleAllRequests_1$Params, context?: HttpContext): Observable<void> {
    return this.appControllerHandleAllRequests_1$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

}
