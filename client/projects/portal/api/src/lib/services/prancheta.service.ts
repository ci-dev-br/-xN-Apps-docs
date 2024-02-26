/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { pranchetaControllerGet } from '../fn/prancheta/prancheta-controller-get';
import { PranchetaControllerGet$Params } from '../fn/prancheta/prancheta-controller-get';
import { pranchetaControllerSync } from '../fn/prancheta/prancheta-controller-sync';
import { PranchetaControllerSync$Params } from '../fn/prancheta/prancheta-controller-sync';

@Injectable({ providedIn: 'root' })
export class PranchetaService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `pranchetaControllerSync()` */
  static readonly PranchetaControllerSyncPath = '/Prancheta/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `pranchetaControllerSync()` instead.
   *
   * This method doesn't expect any request body.
   */
  pranchetaControllerSync$Response(params?: PranchetaControllerSync$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return pranchetaControllerSync(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `pranchetaControllerSync$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  pranchetaControllerSync(params?: PranchetaControllerSync$Params, context?: HttpContext): Observable<void> {
    return this.pranchetaControllerSync$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `pranchetaControllerGet()` */
  static readonly PranchetaControllerGetPath = '/Prancheta/Get';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `pranchetaControllerGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  pranchetaControllerGet$Response(params?: PranchetaControllerGet$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return pranchetaControllerGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `pranchetaControllerGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  pranchetaControllerGet(params?: PranchetaControllerGet$Params, context?: HttpContext): Observable<void> {
    return this.pranchetaControllerGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

}
