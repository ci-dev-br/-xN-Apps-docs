/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { getListEndereco } from '../fn/endereco/get-list-endereco';
import { GetListEndereco$Params } from '../fn/endereco/get-list-endereco';
import { syncEndereco } from '../fn/endereco/sync-endereco';
import { SyncEndereco$Params } from '../fn/endereco/sync-endereco';
import { SyncPayloadDaoEndereco } from '../models/sync-payload-dao-endereco';
import { Endereco } from '../models/endereco';
import { GetByInternalIdInputDto } from '../models/get-by-internal-id-input-dto';
import { RequestBuilder } from '../request-builder';
import { filter } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';

@Injectable()
export class EnderecoService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncEndereco()` */
  static readonly SyncEnderecoPath = '/Endereco/Sync';
  static readonly GetByInternalIdEnderecoPath = '/Endereco/GetByInternalId';
  static readonly DeleteEnderecoPath = '/Endereco/Delete';

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

  getByInternalId(params: { body: GetByInternalIdInputDto }, context?: HttpContext): Observable<Endereco> {
    const rb = new RequestBuilder(this.rootUrl, EnderecoService.GetByInternalIdEnderecoPath, 'post');
    if (params) rb.body(params.body, 'application/json');
    return this.http.request(rb.build({ responseType: 'json', accept: 'application/json', context })).pipe(
      filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => (r as StrictHttpResponse<Endereco>).body)
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

  delete(params: { body: Endereco }, context?: HttpContext): Observable<Endereco> {
    const rb = new RequestBuilder(this.rootUrl, EnderecoService.DeleteEnderecoPath, 'post');
    if (params) rb.body(params.body, 'application/json');
    return this.http.request(rb.build({ responseType: 'json', accept: 'application/json', context })).pipe(
      filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => (r as StrictHttpResponse<Endereco>).body)
    );
  }

}
