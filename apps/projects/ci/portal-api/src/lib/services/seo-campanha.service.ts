/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { deleteSeoCampanha } from '../fn/seo-campanha/delete-seo-campanha';
import { DeleteSeoCampanha$Params } from '../fn/seo-campanha/delete-seo-campanha';
import { getByInternalIdSeoCampanha } from '../fn/seo-campanha/get-by-internal-id-seo-campanha';
import { GetByInternalIdSeoCampanha$Params } from '../fn/seo-campanha/get-by-internal-id-seo-campanha';
import { getListSeoCampanha } from '../fn/seo-campanha/get-list-seo-campanha';
import { GetListSeoCampanha$Params } from '../fn/seo-campanha/get-list-seo-campanha';
import { SeoCampanha } from '../models/seo-campanha';
import { syncSeoCampanha } from '../fn/seo-campanha/sync-seo-campanha';
import { SyncSeoCampanha$Params } from '../fn/seo-campanha/sync-seo-campanha';

@Injectable()
export class SeoCampanhaService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncSeoCampanha()` */
  static readonly SyncSeoCampanhaPath = '/SeoCampanha/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncSeoCampanha()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncSeoCampanha$Response(params: SyncSeoCampanha$Params, context?: HttpContext): Observable<StrictHttpResponse<SeoCampanha>> {
    return syncSeoCampanha(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncSeoCampanha$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncSeoCampanha$Params, context?: HttpContext): Observable<SeoCampanha> {
    return this.syncSeoCampanha$Response(params, context).pipe(
      map((r: StrictHttpResponse<SeoCampanha>): SeoCampanha => r.body)
    );
  }

  /** Path part for operation `getByInternalIdSeoCampanha()` */
  static readonly GetByInternalIdSeoCampanhaPath = '/SeoCampanha/GetByInternalId';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getByInternalIdSeoCampanha()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalIdSeoCampanha$Response(params: GetByInternalIdSeoCampanha$Params, context?: HttpContext): Observable<StrictHttpResponse<SeoCampanha>> {
    return getByInternalIdSeoCampanha(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getByInternalIdSeoCampanha$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalId(params: GetByInternalIdSeoCampanha$Params, context?: HttpContext): Observable<SeoCampanha> {
    return this.getByInternalIdSeoCampanha$Response(params, context).pipe(
      map((r: StrictHttpResponse<SeoCampanha>): SeoCampanha => r.body)
    );
  }

  /** Path part for operation `getListSeoCampanha()` */
  static readonly GetListSeoCampanhaPath = '/SeoCampanha/GetList';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListSeoCampanha()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListSeoCampanha$Response(params: GetListSeoCampanha$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<SeoCampanha>>> {
    return getListSeoCampanha(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListSeoCampanha$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListSeoCampanha$Params, context?: HttpContext): Observable<Array<SeoCampanha>> {
    return this.getListSeoCampanha$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<SeoCampanha>>): Array<SeoCampanha> => r.body)
    );
  }

  /** Path part for operation `deleteSeoCampanha()` */
  static readonly DeleteSeoCampanhaPath = '/SeoCampanha/Delete';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `deleteSeoCampanha()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  deleteSeoCampanha$Response(params: DeleteSeoCampanha$Params, context?: HttpContext): Observable<StrictHttpResponse<SeoCampanha>> {
    return deleteSeoCampanha(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `deleteSeoCampanha$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  delete(params: DeleteSeoCampanha$Params, context?: HttpContext): Observable<SeoCampanha> {
    return this.deleteSeoCampanha$Response(params, context).pipe(
      map((r: StrictHttpResponse<SeoCampanha>): SeoCampanha => r.body)
    );
  }

}
