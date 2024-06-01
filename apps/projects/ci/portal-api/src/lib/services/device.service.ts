/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { deviceConnect } from '../fn/device/device-connect';
import { DeviceConnect$Params } from '../fn/device/device-connect';
import { DevicePayload } from '../models/device-payload';
import { devicePool } from '../fn/device/device-pool';
import { DevicePool$Params } from '../fn/device/device-pool';
import { PoolDto } from '../models/pool-dto';

@Injectable({ providedIn: 'root' })
export class DeviceService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `deviceConnect()` */
  static readonly DeviceConnectPath = '/Device/Connect';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `deviceConnect()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  deviceConnect$Response(params: DeviceConnect$Params, context?: HttpContext): Observable<StrictHttpResponse<DevicePayload>> {
    return deviceConnect(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `deviceConnect$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  deviceConnect(params: DeviceConnect$Params, context?: HttpContext): Observable<DevicePayload> {
    return this.deviceConnect$Response(params, context).pipe(
      map((r: StrictHttpResponse<DevicePayload>): DevicePayload => r.body)
    );
  }

  /** Path part for operation `devicePool()` */
  static readonly DevicePoolPath = '/Device/Pool';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `devicePool()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  devicePool$Response(params: DevicePool$Params, context?: HttpContext): Observable<StrictHttpResponse<PoolDto>> {
    return devicePool(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `devicePool$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  devicePool(params: DevicePool$Params, context?: HttpContext): Observable<PoolDto> {
    return this.devicePool$Response(params, context).pipe(
      map((r: StrictHttpResponse<PoolDto>): PoolDto => r.body)
    );
  }

}
