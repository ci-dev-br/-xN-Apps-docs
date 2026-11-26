/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { deleteUnidadeMedida } from '../fn/unidade-medida/delete-unidade-medida';
import { DeleteUnidadeMedida$Params } from '../fn/unidade-medida/delete-unidade-medida';
import { getByInternalIdUnidadeMedida } from '../fn/unidade-medida/get-by-internal-id-unidade-medida';
import { GetByInternalIdUnidadeMedida$Params } from '../fn/unidade-medida/get-by-internal-id-unidade-medida';
import { getListUnidadeMedida } from '../fn/unidade-medida/get-list-unidade-medida';
import { GetListUnidadeMedida$Params } from '../fn/unidade-medida/get-list-unidade-medida';
import { syncUnidadeMedida } from '../fn/unidade-medida/sync-unidade-medida';
import { SyncUnidadeMedida$Params } from '../fn/unidade-medida/sync-unidade-medida';
import { UnidadeMedida } from '../models/unidade-medida';

@Injectable()
export class UnidadeMedidaService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncUnidadeMedida()` */
  static readonly SyncUnidadeMedidaPath = '/UnidadeMedida/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncUnidadeMedida()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncUnidadeMedida$Response(params: SyncUnidadeMedida$Params, context?: HttpContext): Observable<StrictHttpResponse<UnidadeMedida>> {
    return syncUnidadeMedida(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncUnidadeMedida$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncUnidadeMedida$Params, context?: HttpContext): Observable<UnidadeMedida> {
    return this.syncUnidadeMedida$Response(params, context).pipe(
      map((r: StrictHttpResponse<UnidadeMedida>): UnidadeMedida => r.body)
    );
  }

  /** Path part for operation `getByInternalIdUnidadeMedida()` */
  static readonly GetByInternalIdUnidadeMedidaPath = '/UnidadeMedida/GetByInternalId';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getByInternalIdUnidadeMedida()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalIdUnidadeMedida$Response(params: GetByInternalIdUnidadeMedida$Params, context?: HttpContext): Observable<StrictHttpResponse<UnidadeMedida>> {
    return getByInternalIdUnidadeMedida(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getByInternalIdUnidadeMedida$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalId(params: GetByInternalIdUnidadeMedida$Params, context?: HttpContext): Observable<UnidadeMedida> {
    return this.getByInternalIdUnidadeMedida$Response(params, context).pipe(
      map((r: StrictHttpResponse<UnidadeMedida>): UnidadeMedida => r.body)
    );
  }

  /** Path part for operation `getListUnidadeMedida()` */
  static readonly GetListUnidadeMedidaPath = '/UnidadeMedida/GetList';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListUnidadeMedida()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListUnidadeMedida$Response(params: GetListUnidadeMedida$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<UnidadeMedida>>> {
    return getListUnidadeMedida(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListUnidadeMedida$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListUnidadeMedida$Params, context?: HttpContext): Observable<Array<UnidadeMedida>> {
    return this.getListUnidadeMedida$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<UnidadeMedida>>): Array<UnidadeMedida> => r.body)
    );
  }

  /** Path part for operation `deleteUnidadeMedida()` */
  static readonly DeleteUnidadeMedidaPath = '/UnidadeMedida/Delete';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `deleteUnidadeMedida()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  deleteUnidadeMedida$Response(params: DeleteUnidadeMedida$Params, context?: HttpContext): Observable<StrictHttpResponse<UnidadeMedida>> {
    return deleteUnidadeMedida(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `deleteUnidadeMedida$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  delete(params: DeleteUnidadeMedida$Params, context?: HttpContext): Observable<UnidadeMedida> {
    return this.deleteUnidadeMedida$Response(params, context).pipe(
      map((r: StrictHttpResponse<UnidadeMedida>): UnidadeMedida => r.body)
    );
  }

}
