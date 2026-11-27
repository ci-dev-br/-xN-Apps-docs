/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { deletePromocao } from '../fn/promocao/delete-promocao';
import { DeletePromocao$Params } from '../fn/promocao/delete-promocao';
import { getByInternalIdPromocao } from '../fn/promocao/get-by-internal-id-promocao';
import { GetByInternalIdPromocao$Params } from '../fn/promocao/get-by-internal-id-promocao';
import { getListPromocao } from '../fn/promocao/get-list-promocao';
import { GetListPromocao$Params } from '../fn/promocao/get-list-promocao';
import { Promocao } from '../models/promocao';
import { syncPromocao } from '../fn/promocao/sync-promocao';
import { SyncPromocao$Params } from '../fn/promocao/sync-promocao';

@Injectable()
export class PromocaoService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncPromocao()` */
  static readonly SyncPromocaoPath = '/Promocao/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncPromocao()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncPromocao$Response(params: SyncPromocao$Params, context?: HttpContext): Observable<StrictHttpResponse<Promocao>> {
    return syncPromocao(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncPromocao$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncPromocao$Params, context?: HttpContext): Observable<Promocao> {
    return this.syncPromocao$Response(params, context).pipe(
      map((r: StrictHttpResponse<Promocao>): Promocao => r.body)
    );
  }

  /** Path part for operation `getByInternalIdPromocao()` */
  static readonly GetByInternalIdPromocaoPath = '/Promocao/GetByInternalId';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getByInternalIdPromocao()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalIdPromocao$Response(params: GetByInternalIdPromocao$Params, context?: HttpContext): Observable<StrictHttpResponse<Promocao>> {
    return getByInternalIdPromocao(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getByInternalIdPromocao$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalId(params: GetByInternalIdPromocao$Params, context?: HttpContext): Observable<Promocao> {
    return this.getByInternalIdPromocao$Response(params, context).pipe(
      map((r: StrictHttpResponse<Promocao>): Promocao => r.body)
    );
  }

  /** Path part for operation `getListPromocao()` */
  static readonly GetListPromocaoPath = '/Promocao/GetList';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListPromocao()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListPromocao$Response(params: GetListPromocao$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<Promocao>>> {
    return getListPromocao(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListPromocao$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListPromocao$Params, context?: HttpContext): Observable<Array<Promocao>> {
    return this.getListPromocao$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<Promocao>>): Array<Promocao> => r.body)
    );
  }

  /** Path part for operation `deletePromocao()` */
  static readonly DeletePromocaoPath = '/Promocao/Delete';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `deletePromocao()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  deletePromocao$Response(params: DeletePromocao$Params, context?: HttpContext): Observable<StrictHttpResponse<Promocao>> {
    return deletePromocao(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `deletePromocao$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  delete(params: DeletePromocao$Params, context?: HttpContext): Observable<Promocao> {
    return this.deletePromocao$Response(params, context).pipe(
      map((r: StrictHttpResponse<Promocao>): Promocao => r.body)
    );
  }

}
