/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { deleteDocumentoIdentificacao } from '../fn/documento-identificacao/delete-documento-identificacao';
import { DeleteDocumentoIdentificacao$Params } from '../fn/documento-identificacao/delete-documento-identificacao';
import { DocumentoIdentificacao } from '../models/documento-identificacao';
import { getByInternalIdDocumentoIdentificacao } from '../fn/documento-identificacao/get-by-internal-id-documento-identificacao';
import { GetByInternalIdDocumentoIdentificacao$Params } from '../fn/documento-identificacao/get-by-internal-id-documento-identificacao';
import { getListDocumentoIdentificacao } from '../fn/documento-identificacao/get-list-documento-identificacao';
import { GetListDocumentoIdentificacao$Params } from '../fn/documento-identificacao/get-list-documento-identificacao';
import { syncDocumentoIdentificacao } from '../fn/documento-identificacao/sync-documento-identificacao';
import { SyncDocumentoIdentificacao$Params } from '../fn/documento-identificacao/sync-documento-identificacao';
import { SyncPayloadDaoDocumentoIdentificacao } from '../models/sync-payload-dao-documento-identificacao';

@Injectable()
export class DocumentoIdentificacaoService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncDocumentoIdentificacao()` */
  static readonly SyncDocumentoIdentificacaoPath = '/DocumentoIdentificacao/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncDocumentoIdentificacao()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncDocumentoIdentificacao$Response(params: SyncDocumentoIdentificacao$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDaoDocumentoIdentificacao>> {
    return syncDocumentoIdentificacao(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncDocumentoIdentificacao$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncDocumentoIdentificacao$Params, context?: HttpContext): Observable<SyncPayloadDaoDocumentoIdentificacao> {
    return this.syncDocumentoIdentificacao$Response(params, context).pipe(
      map((r: StrictHttpResponse<SyncPayloadDaoDocumentoIdentificacao>): SyncPayloadDaoDocumentoIdentificacao => r.body)
    );
  }

  /** Path part for operation `getByInternalIdDocumentoIdentificacao()` */
  static readonly GetByInternalIdDocumentoIdentificacaoPath = '/DocumentoIdentificacao/GetByInternalId';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getByInternalIdDocumentoIdentificacao()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalIdDocumentoIdentificacao$Response(params: GetByInternalIdDocumentoIdentificacao$Params, context?: HttpContext): Observable<StrictHttpResponse<DocumentoIdentificacao>> {
    return getByInternalIdDocumentoIdentificacao(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getByInternalIdDocumentoIdentificacao$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalId(params: GetByInternalIdDocumentoIdentificacao$Params, context?: HttpContext): Observable<DocumentoIdentificacao> {
    return this.getByInternalIdDocumentoIdentificacao$Response(params, context).pipe(
      map((r: StrictHttpResponse<DocumentoIdentificacao>): DocumentoIdentificacao => r.body)
    );
  }

  /** Path part for operation `getListDocumentoIdentificacao()` */
  static readonly GetListDocumentoIdentificacaoPath = '/DocumentoIdentificacao/GetList';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListDocumentoIdentificacao()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListDocumentoIdentificacao$Response(params: GetListDocumentoIdentificacao$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDaoDocumentoIdentificacao>> {
    return getListDocumentoIdentificacao(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListDocumentoIdentificacao$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListDocumentoIdentificacao$Params, context?: HttpContext): Observable<SyncPayloadDaoDocumentoIdentificacao> {
    return this.getListDocumentoIdentificacao$Response(params, context).pipe(
      map((r: StrictHttpResponse<SyncPayloadDaoDocumentoIdentificacao>): SyncPayloadDaoDocumentoIdentificacao => r.body)
    );
  }

  /** Path part for operation `deleteDocumentoIdentificacao()` */
  static readonly DeleteDocumentoIdentificacaoPath = '/DocumentoIdentificacao/Delete';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `deleteDocumentoIdentificacao()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  deleteDocumentoIdentificacao$Response(params: DeleteDocumentoIdentificacao$Params, context?: HttpContext): Observable<StrictHttpResponse<DocumentoIdentificacao>> {
    return deleteDocumentoIdentificacao(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `deleteDocumentoIdentificacao$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  delete(params: DeleteDocumentoIdentificacao$Params, context?: HttpContext): Observable<DocumentoIdentificacao> {
    return this.deleteDocumentoIdentificacao$Response(params, context).pipe(
      map((r: StrictHttpResponse<DocumentoIdentificacao>): DocumentoIdentificacao => r.body)
    );
  }

}
