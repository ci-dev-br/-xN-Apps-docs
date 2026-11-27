/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { ClienteCrm } from '../models/cliente-crm';
import { deleteClienteCrm } from '../fn/cliente-crm/delete-cliente-crm';
import { DeleteClienteCrm$Params } from '../fn/cliente-crm/delete-cliente-crm';
import { getByInternalIdClienteCrm } from '../fn/cliente-crm/get-by-internal-id-cliente-crm';
import { GetByInternalIdClienteCrm$Params } from '../fn/cliente-crm/get-by-internal-id-cliente-crm';
import { getListClienteCrm } from '../fn/cliente-crm/get-list-cliente-crm';
import { GetListClienteCrm$Params } from '../fn/cliente-crm/get-list-cliente-crm';
import { syncClienteCrm } from '../fn/cliente-crm/sync-cliente-crm';
import { SyncClienteCrm$Params } from '../fn/cliente-crm/sync-cliente-crm';

@Injectable()
export class ClienteCrmService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncClienteCrm()` */
  static readonly SyncClienteCrmPath = '/ClienteCrm/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncClienteCrm()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncClienteCrm$Response(params: SyncClienteCrm$Params, context?: HttpContext): Observable<StrictHttpResponse<ClienteCrm>> {
    return syncClienteCrm(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncClienteCrm$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncClienteCrm$Params, context?: HttpContext): Observable<ClienteCrm> {
    return this.syncClienteCrm$Response(params, context).pipe(
      map((r: StrictHttpResponse<ClienteCrm>): ClienteCrm => r.body)
    );
  }

  /** Path part for operation `getByInternalIdClienteCrm()` */
  static readonly GetByInternalIdClienteCrmPath = '/ClienteCrm/GetByInternalId';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getByInternalIdClienteCrm()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalIdClienteCrm$Response(params: GetByInternalIdClienteCrm$Params, context?: HttpContext): Observable<StrictHttpResponse<ClienteCrm>> {
    return getByInternalIdClienteCrm(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getByInternalIdClienteCrm$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalId(params: GetByInternalIdClienteCrm$Params, context?: HttpContext): Observable<ClienteCrm> {
    return this.getByInternalIdClienteCrm$Response(params, context).pipe(
      map((r: StrictHttpResponse<ClienteCrm>): ClienteCrm => r.body)
    );
  }

  /** Path part for operation `getListClienteCrm()` */
  static readonly GetListClienteCrmPath = '/ClienteCrm/GetList';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListClienteCrm()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListClienteCrm$Response(params: GetListClienteCrm$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<ClienteCrm>>> {
    return getListClienteCrm(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListClienteCrm$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListClienteCrm$Params, context?: HttpContext): Observable<Array<ClienteCrm>> {
    return this.getListClienteCrm$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<ClienteCrm>>): Array<ClienteCrm> => r.body)
    );
  }

  /** Path part for operation `deleteClienteCrm()` */
  static readonly DeleteClienteCrmPath = '/ClienteCrm/Delete';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `deleteClienteCrm()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  deleteClienteCrm$Response(params: DeleteClienteCrm$Params, context?: HttpContext): Observable<StrictHttpResponse<ClienteCrm>> {
    return deleteClienteCrm(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `deleteClienteCrm$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  delete(params: DeleteClienteCrm$Params, context?: HttpContext): Observable<ClienteCrm> {
    return this.deleteClienteCrm$Response(params, context).pipe(
      map((r: StrictHttpResponse<ClienteCrm>): ClienteCrm => r.body)
    );
  }

}
