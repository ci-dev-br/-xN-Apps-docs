/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { Application } from '../models/application';
import { delete$ } from '../fn/application/delete';
import { Delete$Params } from '../fn/application/delete';
import { get } from '../fn/application/get';
import { Get$Params } from '../fn/application/get';
import { sync } from '../fn/application/sync';
import { Sync$Params } from '../fn/application/sync';

@Injectable({ providedIn: 'root' })
export class ApplicationService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `get()` */
  static readonly GetPath = '/Application/Get';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `get()` instead.
   *
   * This method doesn't expect any request body.
   */
  get$Response(params: Get$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<Application>>> {
    return get(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `get$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  get(params: Get$Params, context?: HttpContext): Observable<Array<Application>> {
    return this.get$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<Application>>): Array<Application> => r.body)
    );
  }

  /** Path part for operation `sync()` */
  static readonly SyncPath = '/Application/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `sync()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync$Response(params: Sync$Params, context?: HttpContext): Observable<StrictHttpResponse<Application>> {
    return sync(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `sync$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: Sync$Params, context?: HttpContext): Observable<Application> {
    return this.sync$Response(params, context).pipe(
      map((r: StrictHttpResponse<Application>): Application => r.body)
    );
  }

  /** Path part for operation `delete()` */
  static readonly DeletePath = '/Application/Delete';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `delete()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  delete$Response(params: Delete$Params, context?: HttpContext): Observable<StrictHttpResponse<Application>> {
    return delete$(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `delete$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  delete(params: Delete$Params, context?: HttpContext): Observable<Application> {
    return this.delete$Response(params, context).pipe(
      map((r: StrictHttpResponse<Application>): Application => r.body)
    );
  }

}
