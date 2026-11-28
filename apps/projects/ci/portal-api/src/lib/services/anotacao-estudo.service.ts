/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { AnotacaoEstudo } from '../models/anotacao-estudo';
import { deleteAnotacaoEstudo } from '../fn/anotacao-estudo/delete-anotacao-estudo';
import { DeleteAnotacaoEstudo$Params } from '../fn/anotacao-estudo/delete-anotacao-estudo';
import { getByInternalIdAnotacaoEstudo } from '../fn/anotacao-estudo/get-by-internal-id-anotacao-estudo';
import { GetByInternalIdAnotacaoEstudo$Params } from '../fn/anotacao-estudo/get-by-internal-id-anotacao-estudo';
import { getListAnotacaoEstudo } from '../fn/anotacao-estudo/get-list-anotacao-estudo';
import { GetListAnotacaoEstudo$Params } from '../fn/anotacao-estudo/get-list-anotacao-estudo';
import { syncAnotacaoEstudo } from '../fn/anotacao-estudo/sync-anotacao-estudo';
import { SyncAnotacaoEstudo$Params } from '../fn/anotacao-estudo/sync-anotacao-estudo';

@Injectable()
export class AnotacaoEstudoService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncAnotacaoEstudo()` */
  static readonly SyncAnotacaoEstudoPath = '/AnotacaoEstudo/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncAnotacaoEstudo()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncAnotacaoEstudo$Response(params: SyncAnotacaoEstudo$Params, context?: HttpContext): Observable<StrictHttpResponse<AnotacaoEstudo>> {
    return syncAnotacaoEstudo(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncAnotacaoEstudo$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncAnotacaoEstudo$Params, context?: HttpContext): Observable<AnotacaoEstudo> {
    return this.syncAnotacaoEstudo$Response(params, context).pipe(
      map((r: StrictHttpResponse<AnotacaoEstudo>): AnotacaoEstudo => r.body)
    );
  }

  /** Path part for operation `getByInternalIdAnotacaoEstudo()` */
  static readonly GetByInternalIdAnotacaoEstudoPath = '/AnotacaoEstudo/GetByInternalId';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getByInternalIdAnotacaoEstudo()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalIdAnotacaoEstudo$Response(params: GetByInternalIdAnotacaoEstudo$Params, context?: HttpContext): Observable<StrictHttpResponse<AnotacaoEstudo>> {
    return getByInternalIdAnotacaoEstudo(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getByInternalIdAnotacaoEstudo$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalId(params: GetByInternalIdAnotacaoEstudo$Params, context?: HttpContext): Observable<AnotacaoEstudo> {
    return this.getByInternalIdAnotacaoEstudo$Response(params, context).pipe(
      map((r: StrictHttpResponse<AnotacaoEstudo>): AnotacaoEstudo => r.body)
    );
  }

  /** Path part for operation `getListAnotacaoEstudo()` */
  static readonly GetListAnotacaoEstudoPath = '/AnotacaoEstudo/GetList';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListAnotacaoEstudo()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListAnotacaoEstudo$Response(params: GetListAnotacaoEstudo$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<AnotacaoEstudo>>> {
    return getListAnotacaoEstudo(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListAnotacaoEstudo$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListAnotacaoEstudo$Params, context?: HttpContext): Observable<Array<AnotacaoEstudo>> {
    return this.getListAnotacaoEstudo$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<AnotacaoEstudo>>): Array<AnotacaoEstudo> => r.body)
    );
  }

  /** Path part for operation `deleteAnotacaoEstudo()` */
  static readonly DeleteAnotacaoEstudoPath = '/AnotacaoEstudo/Delete';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `deleteAnotacaoEstudo()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  deleteAnotacaoEstudo$Response(params: DeleteAnotacaoEstudo$Params, context?: HttpContext): Observable<StrictHttpResponse<AnotacaoEstudo>> {
    return deleteAnotacaoEstudo(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `deleteAnotacaoEstudo$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  delete(params: DeleteAnotacaoEstudo$Params, context?: HttpContext): Observable<AnotacaoEstudo> {
    return this.deleteAnotacaoEstudo$Response(params, context).pipe(
      map((r: StrictHttpResponse<AnotacaoEstudo>): AnotacaoEstudo => r.body)
    );
  }

}
