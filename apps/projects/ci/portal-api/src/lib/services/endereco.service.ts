/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { deleteEndereco } from '../fn/endereco/delete-endereco';
import { DeleteEndereco$Params } from '../fn/endereco/delete-endereco';
import { Endereco } from '../models/endereco';
import { getByInternalIdEndereco } from '../fn/endereco/get-by-internal-id-endereco';
import { GetByInternalIdEndereco$Params } from '../fn/endereco/get-by-internal-id-endereco';
import { getListEndereco } from '../fn/endereco/get-list-endereco';
import { GetListEndereco$Params } from '../fn/endereco/get-list-endereco';
import { syncEndereco } from '../fn/endereco/sync-endereco';
import { SyncEndereco$Params } from '../fn/endereco/sync-endereco';
import { SyncPayloadDaoEndereco } from '../models/sync-payload-dao-endereco';

@Injectable()
export class EnderecoService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncEndereco()` */
  static readonly SyncEnderecoPath = '/Endereco/Sync';

  /**
   * Syncronize data with node api
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncEndereco()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncEndereco$Response(params: SyncEndereco$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDaoEndereco>> {
    return syncEndereco(this.http, this.rootUrl, params, context);
  }

  /**
   * Syncronize data with node api
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncEndereco$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncEndereco$Params, context?: HttpContext): Observable<SyncPayloadDaoEndereco> {
    return this.syncEndereco$Response(params, context).pipe(
      map((r: StrictHttpResponse<SyncPayloadDaoEndereco>): SyncPayloadDaoEndereco => r.body)
    );
  }

  /** Path part for operation `getByInternalIdEndereco()` */
  static readonly GetByInternalIdEnderecoPath = '/Endereco/GetByInternalId';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getByInternalIdEndereco()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalIdEndereco$Response(params: GetByInternalIdEndereco$Params, context?: HttpContext): Observable<StrictHttpResponse<Endereco>> {
    return getByInternalIdEndereco(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getByInternalIdEndereco$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalId(params: GetByInternalIdEndereco$Params, context?: HttpContext): Observable<Endereco> {
    return this.getByInternalIdEndereco$Response(params, context).pipe(
      map((r: StrictHttpResponse<Endereco>): Endereco => r.body)
    );
  }

  /** Path part for operation `getListEndereco()` */
  static readonly GetListEnderecoPath = '/Endereco/Get';

  /**
   * Get list from Endereço Entities
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListEndereco()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListEndereco$Response(params: GetListEndereco$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDaoEndereco>> {
    return getListEndereco(this.http, this.rootUrl, params, context);
  }

  /**
   * Get list from Endereço Entities
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListEndereco$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListEndereco$Params, context?: HttpContext): Observable<SyncPayloadDaoEndereco> {
    return this.getListEndereco$Response(params, context).pipe(
      map((r: StrictHttpResponse<SyncPayloadDaoEndereco>): SyncPayloadDaoEndereco => r.body)
    );
  }

  /** Path part for operation `deleteEndereco()` */
  static readonly DeleteEnderecoPath = '/Endereco/Delete';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `deleteEndereco()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  deleteEndereco$Response(params: DeleteEndereco$Params, context?: HttpContext): Observable<StrictHttpResponse<Endereco>> {
    return deleteEndereco(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `deleteEndereco$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  delete(params: DeleteEndereco$Params, context?: HttpContext): Observable<Endereco> {
    return this.deleteEndereco$Response(params, context).pipe(
      map((r: StrictHttpResponse<Endereco>): Endereco => r.body)
    );
  }

}
