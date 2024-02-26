/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { getPhoto } from '../fn/photo/get-photo';
import { GetPhoto$Params } from '../fn/photo/get-photo';
import { Photo } from '../models/photo';
import { syncPhoto } from '../fn/photo/sync-photo';
import { SyncPhoto$Params } from '../fn/photo/sync-photo';

@Injectable({ providedIn: 'root' })
export class PhotoService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncPhoto()` */
  static readonly SyncPhotoPath = '/Photo/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncPhoto()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncPhoto$Response(params: SyncPhoto$Params, context?: HttpContext): Observable<StrictHttpResponse<Photo>> {
    return syncPhoto(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncPhoto$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncPhoto(params: SyncPhoto$Params, context?: HttpContext): Observable<Photo> {
    return this.syncPhoto$Response(params, context).pipe(
      map((r: StrictHttpResponse<Photo>): Photo => r.body)
    );
  }

  /** Path part for operation `getPhoto()` */
  static readonly GetPhotoPath = '/Photo/Get';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getPhoto()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getPhoto$Response(params: GetPhoto$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<Photo>>> {
    return getPhoto(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getPhoto$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getPhoto(params: GetPhoto$Params, context?: HttpContext): Observable<Array<Photo>> {
    return this.getPhoto$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<Photo>>): Array<Photo> => r.body)
    );
  }

}
