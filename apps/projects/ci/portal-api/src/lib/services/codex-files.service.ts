/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { locateCodexSourceFiles } from '../fn/codex-files/locate-codex-source-files';
import { LocateCodexSourceFiles$Params } from '../fn/codex-files/locate-codex-source-files';
import { locateCodexSourceFilesGet } from '../fn/codex-files/locate-codex-source-files-get';
import { LocateCodexSourceFilesGet$Params } from '../fn/codex-files/locate-codex-source-files-get';
import { LocateSourceFileOutputDto } from '../models/locate-source-file-output-dto';

@Injectable()
export class CodexFilesService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `locateCodexSourceFilesGet()` */
  static readonly LocateCodexSourceFilesGetPath = '/Codex/Files/Locate';

  /**
   * Localiza arquivos de código-fonte no workspace pelo nome (requer role DEVELOPER ou SYSADMIN).
   *
   *
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `locateCodexSourceFilesGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  locateCodexSourceFilesGet$Response(params: LocateCodexSourceFilesGet$Params, context?: HttpContext): Observable<StrictHttpResponse<LocateSourceFileOutputDto>> {
    return locateCodexSourceFilesGet(this.http, this.rootUrl, params, context);
  }

  /**
   * Localiza arquivos de código-fonte no workspace pelo nome (requer role DEVELOPER ou SYSADMIN).
   *
   *
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `locateCodexSourceFilesGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  locateCodexSourceFilesGet(params: LocateCodexSourceFilesGet$Params, context?: HttpContext): Observable<LocateSourceFileOutputDto> {
    return this.locateCodexSourceFilesGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<LocateSourceFileOutputDto>): LocateSourceFileOutputDto => r.body)
    );
  }

  /** Path part for operation `locateCodexSourceFiles()` */
  static readonly LocateCodexSourceFilesPath = '/Codex/Files/Locate';

  /**
   * Localiza arquivos de código-fonte no workspace pelo nome (requer role DEVELOPER ou SYSADMIN).
   *
   *
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `locateCodexSourceFiles()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  locateCodexSourceFiles$Response(params: LocateCodexSourceFiles$Params, context?: HttpContext): Observable<StrictHttpResponse<LocateSourceFileOutputDto>> {
    return locateCodexSourceFiles(this.http, this.rootUrl, params, context);
  }

  /**
   * Localiza arquivos de código-fonte no workspace pelo nome (requer role DEVELOPER ou SYSADMIN).
   *
   *
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `locateCodexSourceFiles$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  locateCodexSourceFiles(params: LocateCodexSourceFiles$Params, context?: HttpContext): Observable<LocateSourceFileOutputDto> {
    return this.locateCodexSourceFiles$Response(params, context).pipe(
      map((r: StrictHttpResponse<LocateSourceFileOutputDto>): LocateSourceFileOutputDto => r.body)
    );
  }

}
