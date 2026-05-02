/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { File } from '../models/file';
import { getFile } from '../fn/file/get-file';
import { GetFile$Params } from '../fn/file/get-file';
import { syncFile } from '../fn/file/sync-file';
import { SyncFile$Params } from '../fn/file/sync-file';

@Injectable()
export class FileService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncFile()` */
  static readonly SyncFilePath = '/File/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncFile()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncFile$Response(params: SyncFile$Params, context?: HttpContext): Observable<StrictHttpResponse<File>> {
    return syncFile(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncFile$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncFile$Params, context?: HttpContext): Observable<File> {
    return this.syncFile$Response(params, context).pipe(
      map((r: StrictHttpResponse<File>): File => r.body)
    );
  }

  /** Path part for operation `getFile()` */
  static readonly GetFilePath = '/File/Get';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getFile()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getFile$Response(params: GetFile$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<File>>> {
    return getFile(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getFile$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  get(params: GetFile$Params, context?: HttpContext): Observable<Array<File>> {
    return this.getFile$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<File>>): Array<File> => r.body)
    );
  }

}
