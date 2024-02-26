/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { organizacaoFind } from '../fn/organizacao/organizacao-find';
import { OrganizacaoFind$Params } from '../fn/organizacao/organizacao-find';
import { OrganizacaoFindResult } from '../models/organizacao-find-result';
import { organizacaoGetCurrent } from '../fn/organizacao/organizacao-get-current';
import { OrganizacaoGetCurrent$Params } from '../fn/organizacao/organizacao-get-current';
import { organizacaoSync } from '../fn/organizacao/organizacao-sync';
import { OrganizacaoSync$Params } from '../fn/organizacao/organizacao-sync';

@Injectable({ providedIn: 'root' })
export class OrganizacaoService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `organizacaoSync()` */
  static readonly OrganizacaoSyncPath = '/Organizacao/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `organizacaoSync()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  organizacaoSync$Response(params: OrganizacaoSync$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return organizacaoSync(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `organizacaoSync$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  organizacaoSync(params: OrganizacaoSync$Params, context?: HttpContext): Observable<void> {
    return this.organizacaoSync$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `organizacaoGetCurrent()` */
  static readonly OrganizacaoGetCurrentPath = '/Organizacao/GetCurrent';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `organizacaoGetCurrent()` instead.
   *
   * This method doesn't expect any request body.
   */
  organizacaoGetCurrent$Response(params?: OrganizacaoGetCurrent$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return organizacaoGetCurrent(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `organizacaoGetCurrent$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  organizacaoGetCurrent(params?: OrganizacaoGetCurrent$Params, context?: HttpContext): Observable<void> {
    return this.organizacaoGetCurrent$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `organizacaoFind()` */
  static readonly OrganizacaoFindPath = '/Organizacao/Find';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `organizacaoFind()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  organizacaoFind$Response(params: OrganizacaoFind$Params, context?: HttpContext): Observable<StrictHttpResponse<OrganizacaoFindResult>> {
    return organizacaoFind(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `organizacaoFind$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  organizacaoFind(params: OrganizacaoFind$Params, context?: HttpContext): Observable<OrganizacaoFindResult> {
    return this.organizacaoFind$Response(params, context).pipe(
      map((r: StrictHttpResponse<OrganizacaoFindResult>): OrganizacaoFindResult => r.body)
    );
  }

}
