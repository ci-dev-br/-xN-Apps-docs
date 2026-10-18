/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { getListUnidadeMedida } from '../fn/unidade-medida/get-list-unidade-medida';
import { GetListUnidadeMedida$Params } from '../fn/unidade-medida/get-list-unidade-medida';
import { syncUnidadeMedida } from '../fn/unidade-medida/sync-unidade-medida';
import { SyncUnidadeMedida$Params } from '../fn/unidade-medida/sync-unidade-medida';
import { UnidadeMedida } from '../models/unidade-medida';
import { GetByInternalIdInputDto } from '../models/get-by-internal-id-input-dto';
import { RequestBuilder } from '../request-builder';
import { filter } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';

@Injectable()
export class UnidadeMedidaService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncUnidadeMedida()` */
  static readonly SyncUnidadeMedidaPath = '/UnidadeMedida/Sync';
  static readonly GetByInternalIdUnidadeMedidaPath = '/UnidadeMedida/GetByInternalId';
  static readonly DeleteUnidadeMedidaPath = '/UnidadeMedida/Delete';

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

  getByInternalId(params: { body: GetByInternalIdInputDto }, context?: HttpContext): Observable<UnidadeMedida> {
    const rb = new RequestBuilder(this.rootUrl, UnidadeMedidaService.GetByInternalIdUnidadeMedidaPath, 'post');
    if (params) rb.body(params.body, 'application/json');
    return this.http.request(rb.build({ responseType: 'json', accept: 'application/json', context })).pipe(
      filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => (r as StrictHttpResponse<UnidadeMedida>).body)
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

  delete(params: { body: UnidadeMedida }, context?: HttpContext): Observable<UnidadeMedida> {
    const rb = new RequestBuilder(this.rootUrl, UnidadeMedidaService.DeleteUnidadeMedidaPath, 'post');
    if (params) rb.body(params.body, 'application/json');
    return this.http.request(rb.build({ responseType: 'json', accept: 'application/json', context })).pipe(
      filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => (r as StrictHttpResponse<UnidadeMedida>).body)
    );
  }

}
