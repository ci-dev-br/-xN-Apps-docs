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
import { deleteApplication } from '../fn/application/delete-application';
import { DeleteApplication$Params } from '../fn/application/delete-application';
import { getListApplication } from '../fn/application/get-list-application';
import { GetListApplication$Params } from '../fn/application/get-list-application';
import { syncApplication } from '../fn/application/sync-application';
import { SyncApplication$Params } from '../fn/application/sync-application';

@Injectable()
export class ApplicationService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `getListApplication()` */
  static readonly GetListApplicationPath = '/Application/Get';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListApplication()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListApplication$Response(params: GetListApplication$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<Application>>> {
    return getListApplication(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListApplication$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListApplication$Params, context?: HttpContext): Observable<Array<Application>> {
    return this.getListApplication$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<Application>>): Array<Application> => r.body)
    );
  }

  /** Path part for operation `syncApplication()` */
  static readonly SyncApplicationPath = '/Application/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncApplication()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncApplication$Response(params: SyncApplication$Params, context?: HttpContext): Observable<StrictHttpResponse<Application>> {
    return syncApplication(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncApplication$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncApplication$Params, context?: HttpContext): Observable<Application> {
    return this.syncApplication$Response(params, context).pipe(
      map((r: StrictHttpResponse<Application>): Application => r.body)
    );
  }

  /** Path part for operation `deleteApplication()` */
  static readonly DeleteApplicationPath = '/Application/Delete';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `deleteApplication()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  deleteApplication$Response(params: DeleteApplication$Params, context?: HttpContext): Observable<StrictHttpResponse<Application>> {
    return deleteApplication(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `deleteApplication$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  delete(params: DeleteApplication$Params, context?: HttpContext): Observable<Application> {
    return this.deleteApplication$Response(params, context).pipe(
      map((r: StrictHttpResponse<Application>): Application => r.body)
    );
  }

}
