/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { deleteTipoDocumentoIdentificacao } from '../fn/tipo-documento-identificacao/delete-tipo-documento-identificacao';
import { DeleteTipoDocumentoIdentificacao$Params } from '../fn/tipo-documento-identificacao/delete-tipo-documento-identificacao';
import { getByInternalIdTipoDocumentoIdentificacao } from '../fn/tipo-documento-identificacao/get-by-internal-id-tipo-documento-identificacao';
import { GetByInternalIdTipoDocumentoIdentificacao$Params } from '../fn/tipo-documento-identificacao/get-by-internal-id-tipo-documento-identificacao';
import { getListTipoDocumentoIdentificacao } from '../fn/tipo-documento-identificacao/get-list-tipo-documento-identificacao';
import { GetListTipoDocumentoIdentificacao$Params } from '../fn/tipo-documento-identificacao/get-list-tipo-documento-identificacao';
import { SyncPayloadDaoTipoDocumentoIdentificacao } from '../models/sync-payload-dao-tipo-documento-identificacao';
import { syncTipoDocumentoIdentificacao } from '../fn/tipo-documento-identificacao/sync-tipo-documento-identificacao';
import { SyncTipoDocumentoIdentificacao$Params } from '../fn/tipo-documento-identificacao/sync-tipo-documento-identificacao';
import { TipoDocumentoIdentificacao } from '../models/tipo-documento-identificacao';

@Injectable()
export class TipoDocumentoIdentificacaoService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncTipoDocumentoIdentificacao()` */
  static readonly SyncTipoDocumentoIdentificacaoPath = '/TipoDocumentoIdentificacao/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncTipoDocumentoIdentificacao()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncTipoDocumentoIdentificacao$Response(params: SyncTipoDocumentoIdentificacao$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDaoTipoDocumentoIdentificacao>> {
    return syncTipoDocumentoIdentificacao(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncTipoDocumentoIdentificacao$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncTipoDocumentoIdentificacao$Params, context?: HttpContext): Observable<SyncPayloadDaoTipoDocumentoIdentificacao> {
    return this.syncTipoDocumentoIdentificacao$Response(params, context).pipe(
      map((r: StrictHttpResponse<SyncPayloadDaoTipoDocumentoIdentificacao>): SyncPayloadDaoTipoDocumentoIdentificacao => r.body)
    );
  }

  /** Path part for operation `getByInternalIdTipoDocumentoIdentificacao()` */
  static readonly GetByInternalIdTipoDocumentoIdentificacaoPath = '/TipoDocumentoIdentificacao/GetByInternalId';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getByInternalIdTipoDocumentoIdentificacao()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalIdTipoDocumentoIdentificacao$Response(params: GetByInternalIdTipoDocumentoIdentificacao$Params, context?: HttpContext): Observable<StrictHttpResponse<TipoDocumentoIdentificacao>> {
    return getByInternalIdTipoDocumentoIdentificacao(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getByInternalIdTipoDocumentoIdentificacao$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalId(params: GetByInternalIdTipoDocumentoIdentificacao$Params, context?: HttpContext): Observable<TipoDocumentoIdentificacao> {
    return this.getByInternalIdTipoDocumentoIdentificacao$Response(params, context).pipe(
      map((r: StrictHttpResponse<TipoDocumentoIdentificacao>): TipoDocumentoIdentificacao => r.body)
    );
  }

  /** Path part for operation `getListTipoDocumentoIdentificacao()` */
  static readonly GetListTipoDocumentoIdentificacaoPath = '/TipoDocumentoIdentificacao/GetList';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListTipoDocumentoIdentificacao()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListTipoDocumentoIdentificacao$Response(params: GetListTipoDocumentoIdentificacao$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDaoTipoDocumentoIdentificacao>> {
    return getListTipoDocumentoIdentificacao(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListTipoDocumentoIdentificacao$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListTipoDocumentoIdentificacao$Params, context?: HttpContext): Observable<SyncPayloadDaoTipoDocumentoIdentificacao> {
    return this.getListTipoDocumentoIdentificacao$Response(params, context).pipe(
      map((r: StrictHttpResponse<SyncPayloadDaoTipoDocumentoIdentificacao>): SyncPayloadDaoTipoDocumentoIdentificacao => r.body)
    );
  }

  /** Path part for operation `deleteTipoDocumentoIdentificacao()` */
  static readonly DeleteTipoDocumentoIdentificacaoPath = '/TipoDocumentoIdentificacao/Delete';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `deleteTipoDocumentoIdentificacao()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  deleteTipoDocumentoIdentificacao$Response(params: DeleteTipoDocumentoIdentificacao$Params, context?: HttpContext): Observable<StrictHttpResponse<TipoDocumentoIdentificacao>> {
    return deleteTipoDocumentoIdentificacao(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `deleteTipoDocumentoIdentificacao$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  delete(params: DeleteTipoDocumentoIdentificacao$Params, context?: HttpContext): Observable<TipoDocumentoIdentificacao> {
    return this.deleteTipoDocumentoIdentificacao$Response(params, context).pipe(
      map((r: StrictHttpResponse<TipoDocumentoIdentificacao>): TipoDocumentoIdentificacao => r.body)
    );
  }

}
