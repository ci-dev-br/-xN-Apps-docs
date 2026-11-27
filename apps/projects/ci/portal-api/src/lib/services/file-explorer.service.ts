/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { authorizeFilePermission } from '../fn/file-explorer/authorize-file-permission';
import { AuthorizeFilePermission$Params } from '../fn/file-explorer/authorize-file-permission';
import { AuthorizeFilePermissionOutputDto } from '../models/authorize-file-permission-output-dto';
import { FileDto } from '../models/file-dto';
import { FilePermissionItemDto } from '../models/file-permission-item-dto';
import { getFilePermissionRequest } from '../fn/file-explorer/get-file-permission-request';
import { GetFilePermissionRequest$Params } from '../fn/file-explorer/get-file-permission-request';
import { myFilePermissions } from '../fn/file-explorer/my-file-permissions';
import { MyFilePermissions$Params } from '../fn/file-explorer/my-file-permissions';
import { MyFilePermissionsOutputDto } from '../models/my-file-permissions-output-dto';
import { readDirectory } from '../fn/file-explorer/read-directory';
import { ReadDirectory$Params } from '../fn/file-explorer/read-directory';
import { ReadDirectoryOutput } from '../models/read-directory-output';
import { readFile } from '../fn/file-explorer/read-file';
import { ReadFile$Params } from '../fn/file-explorer/read-file';
import { requestFilePermission } from '../fn/file-explorer/request-file-permission';
import { RequestFilePermission$Params } from '../fn/file-explorer/request-file-permission';
import { RequestFilePermissionOutputDto } from '../models/request-file-permission-output-dto';

@Injectable()
export class FileExplorerService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `readDirectory()` */
  static readonly ReadDirectoryPath = '/FileExplorer/ReadDirectory';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `readDirectory()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  readDirectory$Response(params: ReadDirectory$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<ReadDirectoryOutput>>> {
    return readDirectory(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `readDirectory$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  readDirectory(params: ReadDirectory$Params, context?: HttpContext): Observable<Array<ReadDirectoryOutput>> {
    return this.readDirectory$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<ReadDirectoryOutput>>): Array<ReadDirectoryOutput> => r.body)
    );
  }

  /** Path part for operation `readFile()` */
  static readonly ReadFilePath = '/FileExplorer/File';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `readFile()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  readFile$Response(params: ReadFile$Params, context?: HttpContext): Observable<StrictHttpResponse<FileDto>> {
    return readFile(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `readFile$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  readFile(params: ReadFile$Params, context?: HttpContext): Observable<FileDto> {
    return this.readFile$Response(params, context).pipe(
      map((r: StrictHttpResponse<FileDto>): FileDto => r.body)
    );
  }

  /** Path part for operation `requestFilePermission()` */
  static readonly RequestFilePermissionPath = '/FileExplorer/RequestPermission';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `requestFilePermission()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  requestFilePermission$Response(params: RequestFilePermission$Params, context?: HttpContext): Observable<StrictHttpResponse<RequestFilePermissionOutputDto>> {
    return requestFilePermission(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `requestFilePermission$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  requestFilePermission(params: RequestFilePermission$Params, context?: HttpContext): Observable<RequestFilePermissionOutputDto> {
    return this.requestFilePermission$Response(params, context).pipe(
      map((r: StrictHttpResponse<RequestFilePermissionOutputDto>): RequestFilePermissionOutputDto => r.body)
    );
  }

  /** Path part for operation `getFilePermissionRequest()` */
  static readonly GetFilePermissionRequestPath = '/FileExplorer/GetPermissionRequest';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getFilePermissionRequest()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getFilePermissionRequest$Response(params: GetFilePermissionRequest$Params, context?: HttpContext): Observable<StrictHttpResponse<FilePermissionItemDto>> {
    return getFilePermissionRequest(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getFilePermissionRequest$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getFilePermissionRequest(params: GetFilePermissionRequest$Params, context?: HttpContext): Observable<FilePermissionItemDto> {
    return this.getFilePermissionRequest$Response(params, context).pipe(
      map((r: StrictHttpResponse<FilePermissionItemDto>): FilePermissionItemDto => r.body)
    );
  }

  /** Path part for operation `authorizeFilePermission()` */
  static readonly AuthorizeFilePermissionPath = '/FileExplorer/AuthorizePermission';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `authorizeFilePermission()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  authorizeFilePermission$Response(params: AuthorizeFilePermission$Params, context?: HttpContext): Observable<StrictHttpResponse<AuthorizeFilePermissionOutputDto>> {
    return authorizeFilePermission(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `authorizeFilePermission$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  authorizeFilePermission(params: AuthorizeFilePermission$Params, context?: HttpContext): Observable<AuthorizeFilePermissionOutputDto> {
    return this.authorizeFilePermission$Response(params, context).pipe(
      map((r: StrictHttpResponse<AuthorizeFilePermissionOutputDto>): AuthorizeFilePermissionOutputDto => r.body)
    );
  }

  /** Path part for operation `myFilePermissions()` */
  static readonly MyFilePermissionsPath = '/FileExplorer/MyPermissions';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `myFilePermissions()` instead.
   *
   * This method doesn't expect any request body.
   */
  myFilePermissions$Response(params?: MyFilePermissions$Params, context?: HttpContext): Observable<StrictHttpResponse<MyFilePermissionsOutputDto>> {
    return myFilePermissions(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `myFilePermissions$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  myFilePermissions(params?: MyFilePermissions$Params, context?: HttpContext): Observable<MyFilePermissionsOutputDto> {
    return this.myFilePermissions$Response(params, context).pipe(
      map((r: StrictHttpResponse<MyFilePermissionsOutputDto>): MyFilePermissionsOutputDto => r.body)
    );
  }

}
