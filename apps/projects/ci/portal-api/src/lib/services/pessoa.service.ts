/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { getByInternalIdPessoa } from '../fn/pessoa/get-by-internal-id-pessoa';
import { GetByInternalIdPessoa$Params } from '../fn/pessoa/get-by-internal-id-pessoa';
import { getListPessoa } from '../fn/pessoa/get-list-pessoa';
import { GetListPessoa$Params } from '../fn/pessoa/get-list-pessoa';
import { Pessoa } from '../models/pessoa';
import { SyncPayloadDaoPessoa } from '../models/sync-payload-dao-pessoa';
import { syncPessoa } from '../fn/pessoa/sync-pessoa';
import { SyncPessoa$Params } from '../fn/pessoa/sync-pessoa';

@Injectable()
export class PessoaService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncPessoa()` */
  static readonly SyncPessoaPath = '/Pessoa/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncPessoa()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncPessoa$Response(params: SyncPessoa$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDaoPessoa>> {
    return syncPessoa(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncPessoa$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncPessoa$Params, context?: HttpContext): Observable<SyncPayloadDaoPessoa> {
    return this.syncPessoa$Response(params, context).pipe(
      map((r: StrictHttpResponse<SyncPayloadDaoPessoa>): SyncPayloadDaoPessoa => r.body)
    );
  }

  /** Path part for operation `getByInternalIdPessoa()` */
  static readonly GetByInternalIdPessoaPath = '/Pessoa/GetByInternalId';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getByInternalIdPessoa()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalIdPessoa$Response(params: GetByInternalIdPessoa$Params, context?: HttpContext): Observable<StrictHttpResponse<Pessoa>> {
    return getByInternalIdPessoa(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getByInternalIdPessoa$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalId(params: GetByInternalIdPessoa$Params, context?: HttpContext): Observable<Pessoa> {
    return this.getByInternalIdPessoa$Response(params, context).pipe(
      map((r: StrictHttpResponse<Pessoa>): Pessoa => r.body)
    );
  }

  /** Path part for operation `getListPessoa()` */
  static readonly GetListPessoaPath = '/Pessoa/GetList';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListPessoa()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListPessoa$Response(params: GetListPessoa$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDaoPessoa>> {
    return getListPessoa(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListPessoa$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListPessoa$Params, context?: HttpContext): Observable<SyncPayloadDaoPessoa> {
    return this.getListPessoa$Response(params, context).pipe(
      map((r: StrictHttpResponse<SyncPayloadDaoPessoa>): SyncPayloadDaoPessoa => r.body)
    );
  }

}
