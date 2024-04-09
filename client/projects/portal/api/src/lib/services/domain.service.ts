/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { Domain } from '../models/domain';
import { domainDelete } from '../fn/domain/domain-delete';
import { DomainDelete$Params } from '../fn/domain/domain-delete';
import { domainSync } from '../fn/domain/domain-sync';
import { DomainSync$Params } from '../fn/domain/domain-sync';

@Injectable({ providedIn: 'root' })
export class DomainService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `domainSync()` */
  static readonly DomainSyncPath = '/Domain/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `domainSync()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  domainSync$Response(params: DomainSync$Params, context?: HttpContext): Observable<StrictHttpResponse<Domain>> {
    return domainSync(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `domainSync$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  domainSync(params: DomainSync$Params, context?: HttpContext): Observable<Domain> {
    return this.domainSync$Response(params, context).pipe(
      map((r: StrictHttpResponse<Domain>): Domain => r.body)
    );
  }

  /** Path part for operation `domainDelete()` */
  static readonly DomainDeletePath = '/Domain/Delete';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `domainDelete()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  domainDelete$Response(params: DomainDelete$Params, context?: HttpContext): Observable<StrictHttpResponse<Domain>> {
    return domainDelete(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `domainDelete$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  domainDelete(params: DomainDelete$Params, context?: HttpContext): Observable<Domain> {
    return this.domainDelete$Response(params, context).pipe(
      map((r: StrictHttpResponse<Domain>): Domain => r.body)
    );
  }

}
