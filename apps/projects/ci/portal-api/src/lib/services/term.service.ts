/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { getListTerm } from '../fn/term/get-list-term';
import { GetListTerm$Params } from '../fn/term/get-list-term';
import { syncTerm } from '../fn/term/sync-term';
import { SyncTerm$Params } from '../fn/term/sync-term';
import { Term } from '../models/term';

@Injectable()
export class TermService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncTerm()` */
  static readonly SyncTermPath = '/Term/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncTerm()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncTerm$Response(params: SyncTerm$Params, context?: HttpContext): Observable<StrictHttpResponse<Term>> {
    return syncTerm(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncTerm$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncTerm$Params, context?: HttpContext): Observable<Term> {
    return this.syncTerm$Response(params, context).pipe(
      map((r: StrictHttpResponse<Term>): Term => r.body)
    );
  }

  /** Path part for operation `getListTerm()` */
  static readonly GetListTermPath = '/Term/GetList';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListTerm()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListTerm$Response(params: GetListTerm$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<Term>>> {
    return getListTerm(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListTerm$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListTerm$Params, context?: HttpContext): Observable<Array<Term>> {
    return this.getListTerm$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<Term>>): Array<Term> => r.body)
    );
  }

}
