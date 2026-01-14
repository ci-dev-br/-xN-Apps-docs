/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { FileDto } from '../models/file-dto';
import { fileExplorerControllerReadDirectory } from '../fn/file-explorer/file-explorer-controller-read-directory';
import { FileExplorerControllerReadDirectory$Params } from '../fn/file-explorer/file-explorer-controller-read-directory';
import { fileExplorerControllerReadFile } from '../fn/file-explorer/file-explorer-controller-read-file';
import { FileExplorerControllerReadFile$Params } from '../fn/file-explorer/file-explorer-controller-read-file';
import { ReadDirectoryOutput } from '../models/read-directory-output';

@Injectable()
export class FileExplorerService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `fileExplorerControllerReadDirectory()` */
  static readonly FileExplorerControllerReadDirectoryPath = '/FileExplorer/ReadDirectory';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `fileExplorerControllerReadDirectory()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  fileExplorerControllerReadDirectory$Response(params: FileExplorerControllerReadDirectory$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<ReadDirectoryOutput>>> {
    return fileExplorerControllerReadDirectory(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `fileExplorerControllerReadDirectory$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  fileExplorerControllerReadDirectory(params: FileExplorerControllerReadDirectory$Params, context?: HttpContext): Observable<Array<ReadDirectoryOutput>> {
    return this.fileExplorerControllerReadDirectory$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<ReadDirectoryOutput>>): Array<ReadDirectoryOutput> => r.body)
    );
  }

  /** Path part for operation `fileExplorerControllerReadFile()` */
  static readonly FileExplorerControllerReadFilePath = '/FileExplorer/File';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `fileExplorerControllerReadFile()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  fileExplorerControllerReadFile$Response(params: FileExplorerControllerReadFile$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<FileDto>>> {
    return fileExplorerControllerReadFile(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `fileExplorerControllerReadFile$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  fileExplorerControllerReadFile(params: FileExplorerControllerReadFile$Params, context?: HttpContext): Observable<Array<FileDto>> {
    return this.fileExplorerControllerReadFile$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<FileDto>>): Array<FileDto> => r.body)
    );
  }

}
