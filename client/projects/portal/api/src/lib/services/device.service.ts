/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { connect } from '../fn/device/connect';
import { Connect$Params } from '../fn/device/connect';
import { DevicePayload } from '../models/device-payload';

@Injectable({ providedIn: 'root' })
export class DeviceService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `connect()` */
  static readonly ConnectPath = '/Device/Connect';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `connect()` instead.
   *
   * This method doesn't expect any request body.
   */
  connect$Response(params?: Connect$Params, context?: HttpContext): Observable<StrictHttpResponse<DevicePayload>> {
    return connect(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `connect$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  connect(params?: Connect$Params, context?: HttpContext): Observable<DevicePayload> {
    return this.connect$Response(params, context).pipe(
      map((r: StrictHttpResponse<DevicePayload>): DevicePayload => r.body)
    );
  }

}
