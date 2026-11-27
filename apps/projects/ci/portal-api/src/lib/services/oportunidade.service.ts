/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { deleteOportunidade } from '../fn/oportunidade/delete-oportunidade';
import { DeleteOportunidade$Params } from '../fn/oportunidade/delete-oportunidade';
import { getByInternalIdOportunidade } from '../fn/oportunidade/get-by-internal-id-oportunidade';
import { GetByInternalIdOportunidade$Params } from '../fn/oportunidade/get-by-internal-id-oportunidade';
import { getListOportunidade } from '../fn/oportunidade/get-list-oportunidade';
import { GetListOportunidade$Params } from '../fn/oportunidade/get-list-oportunidade';
import { Oportunidade } from '../models/oportunidade';
import { syncOportunidade } from '../fn/oportunidade/sync-oportunidade';
import { SyncOportunidade$Params } from '../fn/oportunidade/sync-oportunidade';

@Injectable()
export class OportunidadeService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncOportunidade()` */
  static readonly SyncOportunidadePath = '/Oportunidade/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncOportunidade()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncOportunidade$Response(params: SyncOportunidade$Params, context?: HttpContext): Observable<StrictHttpResponse<Oportunidade>> {
    return syncOportunidade(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncOportunidade$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncOportunidade$Params, context?: HttpContext): Observable<Oportunidade> {
    return this.syncOportunidade$Response(params, context).pipe(
      map((r: StrictHttpResponse<Oportunidade>): Oportunidade => r.body)
    );
  }

  /** Path part for operation `getByInternalIdOportunidade()` */
  static readonly GetByInternalIdOportunidadePath = '/Oportunidade/GetByInternalId';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getByInternalIdOportunidade()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalIdOportunidade$Response(params: GetByInternalIdOportunidade$Params, context?: HttpContext): Observable<StrictHttpResponse<Oportunidade>> {
    return getByInternalIdOportunidade(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getByInternalIdOportunidade$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalId(params: GetByInternalIdOportunidade$Params, context?: HttpContext): Observable<Oportunidade> {
    return this.getByInternalIdOportunidade$Response(params, context).pipe(
      map((r: StrictHttpResponse<Oportunidade>): Oportunidade => r.body)
    );
  }

  /** Path part for operation `getListOportunidade()` */
  static readonly GetListOportunidadePath = '/Oportunidade/GetList';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListOportunidade()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListOportunidade$Response(params: GetListOportunidade$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<Oportunidade>>> {
    return getListOportunidade(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListOportunidade$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListOportunidade$Params, context?: HttpContext): Observable<Array<Oportunidade>> {
    return this.getListOportunidade$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<Oportunidade>>): Array<Oportunidade> => r.body)
    );
  }

  /** Path part for operation `deleteOportunidade()` */
  static readonly DeleteOportunidadePath = '/Oportunidade/Delete';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `deleteOportunidade()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  deleteOportunidade$Response(params: DeleteOportunidade$Params, context?: HttpContext): Observable<StrictHttpResponse<Oportunidade>> {
    return deleteOportunidade(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `deleteOportunidade$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  delete(params: DeleteOportunidade$Params, context?: HttpContext): Observable<Oportunidade> {
    return this.deleteOportunidade$Response(params, context).pipe(
      map((r: StrictHttpResponse<Oportunidade>): Oportunidade => r.body)
    );
  }

}
