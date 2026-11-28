/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { deleteTurma } from '../fn/turma/delete-turma';
import { DeleteTurma$Params } from '../fn/turma/delete-turma';
import { getByInternalIdTurma } from '../fn/turma/get-by-internal-id-turma';
import { GetByInternalIdTurma$Params } from '../fn/turma/get-by-internal-id-turma';
import { getListTurma } from '../fn/turma/get-list-turma';
import { GetListTurma$Params } from '../fn/turma/get-list-turma';
import { syncTurma } from '../fn/turma/sync-turma';
import { SyncTurma$Params } from '../fn/turma/sync-turma';
import { Turma } from '../models/turma';

@Injectable()
export class TurmaService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncTurma()` */
  static readonly SyncTurmaPath = '/Turma/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncTurma()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncTurma$Response(params: SyncTurma$Params, context?: HttpContext): Observable<StrictHttpResponse<Turma>> {
    return syncTurma(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncTurma$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncTurma$Params, context?: HttpContext): Observable<Turma> {
    return this.syncTurma$Response(params, context).pipe(
      map((r: StrictHttpResponse<Turma>): Turma => r.body)
    );
  }

  /** Path part for operation `getByInternalIdTurma()` */
  static readonly GetByInternalIdTurmaPath = '/Turma/GetByInternalId';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getByInternalIdTurma()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalIdTurma$Response(params: GetByInternalIdTurma$Params, context?: HttpContext): Observable<StrictHttpResponse<Turma>> {
    return getByInternalIdTurma(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getByInternalIdTurma$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalId(params: GetByInternalIdTurma$Params, context?: HttpContext): Observable<Turma> {
    return this.getByInternalIdTurma$Response(params, context).pipe(
      map((r: StrictHttpResponse<Turma>): Turma => r.body)
    );
  }

  /** Path part for operation `getListTurma()` */
  static readonly GetListTurmaPath = '/Turma/GetList';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListTurma()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListTurma$Response(params: GetListTurma$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<Turma>>> {
    return getListTurma(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListTurma$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListTurma$Params, context?: HttpContext): Observable<Array<Turma>> {
    return this.getListTurma$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<Turma>>): Array<Turma> => r.body)
    );
  }

  /** Path part for operation `deleteTurma()` */
  static readonly DeleteTurmaPath = '/Turma/Delete';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `deleteTurma()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  deleteTurma$Response(params: DeleteTurma$Params, context?: HttpContext): Observable<StrictHttpResponse<Turma>> {
    return deleteTurma(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `deleteTurma$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  delete(params: DeleteTurma$Params, context?: HttpContext): Observable<Turma> {
    return this.deleteTurma$Response(params, context).pipe(
      map((r: StrictHttpResponse<Turma>): Turma => r.body)
    );
  }

}
