/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { deleteForms } from '../fn/forms/delete-forms';
import { DeleteForms$Params } from '../fn/forms/delete-forms';
import { Forms } from '../models/forms';
import { getByInternalIdForms } from '../fn/forms/get-by-internal-id-forms';
import { GetByInternalIdForms$Params } from '../fn/forms/get-by-internal-id-forms';
import { getListForms } from '../fn/forms/get-list-forms';
import { GetListForms$Params } from '../fn/forms/get-list-forms';
import { syncForms } from '../fn/forms/sync-forms';
import { SyncForms$Params } from '../fn/forms/sync-forms';

@Injectable()
export class FormsService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncForms()` */
  static readonly SyncFormsPath = '/Forms/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncForms()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncForms$Response(params: SyncForms$Params, context?: HttpContext): Observable<StrictHttpResponse<Forms>> {
    return syncForms(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncForms$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncForms$Params, context?: HttpContext): Observable<Forms> {
    return this.syncForms$Response(params, context).pipe(
      map((r: StrictHttpResponse<Forms>): Forms => r.body)
    );
  }

  /** Path part for operation `getListForms()` */
  static readonly GetListFormsPath = '/Forms/GetList';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListForms()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListForms$Response(params: GetListForms$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<Forms>>> {
    return getListForms(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListForms$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListForms$Params, context?: HttpContext): Observable<Array<Forms>> {
    return this.getListForms$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<Forms>>): Array<Forms> => r.body)
    );
  }

  /** Path part for operation `getByInternalIdForms()` */
  static readonly GetByInternalIdFormsPath = '/Forms/GetByInternalId';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getByInternalIdForms()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalIdForms$Response(params: GetByInternalIdForms$Params, context?: HttpContext): Observable<StrictHttpResponse<Forms>> {
    return getByInternalIdForms(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getByInternalIdForms$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalId(params: GetByInternalIdForms$Params, context?: HttpContext): Observable<Forms> {
    return this.getByInternalIdForms$Response(params, context).pipe(
      map((r: StrictHttpResponse<Forms>): Forms => r.body)
    );
  }

  /** Path part for operation `deleteForms()` */
  static readonly DeleteFormsPath = '/Forms/Delete';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `deleteForms()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  deleteForms$Response(params: DeleteForms$Params, context?: HttpContext): Observable<StrictHttpResponse<Forms>> {
    return deleteForms(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `deleteForms$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  delete(params: DeleteForms$Params, context?: HttpContext): Observable<Forms> {
    return this.deleteForms$Response(params, context).pipe(
      map((r: StrictHttpResponse<Forms>): Forms => r.body)
    );
  }

}
