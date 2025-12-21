/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { appControllerGetResource } from '../fn/operations/app-controller-get-resource';
import { AppControllerGetResource$Params } from '../fn/operations/app-controller-get-resource';
import { appControllerRoot } from '../fn/operations/app-controller-root';
import { AppControllerRoot$Params } from '../fn/operations/app-controller-root';

@Injectable()
export class ApiService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `appControllerRoot()` */
  static readonly AppControllerRootPath = '/';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `appControllerRoot()` instead.
   *
   * This method doesn't expect any request body.
   */
  appControllerRoot$Response(params?: AppControllerRoot$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return appControllerRoot(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `appControllerRoot$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  appControllerRoot(params?: AppControllerRoot$Params, context?: HttpContext): Observable<void> {
    return this.appControllerRoot$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `appControllerGetResource()` */
  static readonly AppControllerGetResourcePath = '/*w';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `appControllerGetResource()` instead.
   *
   * This method doesn't expect any request body.
   */
  appControllerGetResource$Response(params?: AppControllerGetResource$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return appControllerGetResource(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `appControllerGetResource$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  appControllerGetResource(params?: AppControllerGetResource$Params, context?: HttpContext): Observable<void> {
    return this.appControllerGetResource$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

}
