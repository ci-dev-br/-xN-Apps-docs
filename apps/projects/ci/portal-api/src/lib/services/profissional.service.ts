/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { deleteProfissional } from '../fn/profissional/delete-profissional';
import { DeleteProfissional$Params } from '../fn/profissional/delete-profissional';
import { getByInternalIdProfissional } from '../fn/profissional/get-by-internal-id-profissional';
import { GetByInternalIdProfissional$Params } from '../fn/profissional/get-by-internal-id-profissional';
import { getListProfissional } from '../fn/profissional/get-list-profissional';
import { GetListProfissional$Params } from '../fn/profissional/get-list-profissional';
import { Profissional } from '../models/profissional';
import { syncProfissional } from '../fn/profissional/sync-profissional';
import { SyncProfissional$Params } from '../fn/profissional/sync-profissional';

@Injectable()
export class ProfissionalService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncProfissional()` */
  static readonly SyncProfissionalPath = '/Profissional/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncProfissional()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncProfissional$Response(params: SyncProfissional$Params, context?: HttpContext): Observable<StrictHttpResponse<Profissional>> {
    return syncProfissional(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncProfissional$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncProfissional$Params, context?: HttpContext): Observable<Profissional> {
    return this.syncProfissional$Response(params, context).pipe(
      map((r: StrictHttpResponse<Profissional>): Profissional => r.body)
    );
  }

  /** Path part for operation `getByInternalIdProfissional()` */
  static readonly GetByInternalIdProfissionalPath = '/Profissional/GetByInternalId';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getByInternalIdProfissional()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalIdProfissional$Response(params: GetByInternalIdProfissional$Params, context?: HttpContext): Observable<StrictHttpResponse<Profissional>> {
    return getByInternalIdProfissional(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getByInternalIdProfissional$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalId(params: GetByInternalIdProfissional$Params, context?: HttpContext): Observable<Profissional> {
    return this.getByInternalIdProfissional$Response(params, context).pipe(
      map((r: StrictHttpResponse<Profissional>): Profissional => r.body)
    );
  }

  /** Path part for operation `getListProfissional()` */
  static readonly GetListProfissionalPath = '/Profissional/GetList';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListProfissional()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListProfissional$Response(params: GetListProfissional$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<Profissional>>> {
    return getListProfissional(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListProfissional$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListProfissional$Params, context?: HttpContext): Observable<Array<Profissional>> {
    return this.getListProfissional$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<Profissional>>): Array<Profissional> => r.body)
    );
  }

  /** Path part for operation `deleteProfissional()` */
  static readonly DeleteProfissionalPath = '/Profissional/Delete';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `deleteProfissional()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  deleteProfissional$Response(params: DeleteProfissional$Params, context?: HttpContext): Observable<StrictHttpResponse<Profissional>> {
    return deleteProfissional(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `deleteProfissional$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  delete(params: DeleteProfissional$Params, context?: HttpContext): Observable<Profissional> {
    return this.deleteProfissional$Response(params, context).pipe(
      map((r: StrictHttpResponse<Profissional>): Profissional => r.body)
    );
  }

}
