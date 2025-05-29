 /* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { deleteDomain } from '../fn/domain/delete-domain';
import { DeleteDomain$Params } from '../fn/domain/delete-domain';
import { Domain } from '../models/domain';
import { getDomain } from '../fn/domain/get-domain';
import { GetDomain$Params } from '../fn/domain/get-domain';
import { syncDomain } from '../fn/domain/sync-domain';
import { SyncDomain$Params } from '../fn/domain/sync-domain';

@Injectable()
export class DomainService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `getDomain()` */
  static readonly GetDomainPath = '/Domain/Get';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getDomain()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getDomain$Response(params: GetDomain$Params, context?: HttpContext): Observable<StrictHttpResponse<Domain>> {
    return getDomain(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getDomain$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  get(params: GetDomain$Params, context?: HttpContext): Observable<Domain> {
    return this.getDomain$Response(params, context).pipe(
      map((r: StrictHttpResponse<Domain>): Domain => r.body)
    );
  }

  /** Path part for operation `syncDomain()` */
  static readonly SyncDomainPath = '/Domain/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncDomain()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncDomain$Response(params: SyncDomain$Params, context?: HttpContext): Observable<StrictHttpResponse<Domain>> {
    return syncDomain(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncDomain$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncDomain$Params, context?: HttpContext): Observable<Domain> {
    return this.syncDomain$Response(params, context).pipe(
      map((r: StrictHttpResponse<Domain>): Domain => r.body)
    );
  }

  /** Path part for operation `deleteDomain()` */
  static readonly DeleteDomainPath = '/Domain/Delete';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `deleteDomain()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  deleteDomain$Response(params: DeleteDomain$Params, context?: HttpContext): Observable<StrictHttpResponse<Domain>> {
    return deleteDomain(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `deleteDomain$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  delete(params: DeleteDomain$Params, context?: HttpContext): Observable<Domain> {
    return this.deleteDomain$Response(params, context).pipe(
      map((r: StrictHttpResponse<Domain>): Domain => r.body)
    );
  }

}
