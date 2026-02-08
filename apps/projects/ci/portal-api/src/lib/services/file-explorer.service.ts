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
import { ReadDirectoryOutput } from '../models/read-directory-output';
import { readFile } from '../fn/file-explorer/read-file';
import { ReadFile$Params } from '../fn/file-explorer/read-file';

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

}
