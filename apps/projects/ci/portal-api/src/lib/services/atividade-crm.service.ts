/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { AtividadeCrm } from '../models/atividade-crm';
import { deleteAtividadeCrm } from '../fn/atividade-crm/delete-atividade-crm';
import { DeleteAtividadeCrm$Params } from '../fn/atividade-crm/delete-atividade-crm';
import { getByInternalIdAtividadeCrm } from '../fn/atividade-crm/get-by-internal-id-atividade-crm';
import { GetByInternalIdAtividadeCrm$Params } from '../fn/atividade-crm/get-by-internal-id-atividade-crm';
import { getListAtividadeCrm } from '../fn/atividade-crm/get-list-atividade-crm';
import { GetListAtividadeCrm$Params } from '../fn/atividade-crm/get-list-atividade-crm';
import { syncAtividadeCrm } from '../fn/atividade-crm/sync-atividade-crm';
import { SyncAtividadeCrm$Params } from '../fn/atividade-crm/sync-atividade-crm';

@Injectable()
export class AtividadeCrmService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncAtividadeCrm()` */
  static readonly SyncAtividadeCrmPath = '/AtividadeCrm/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncAtividadeCrm()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncAtividadeCrm$Response(params: SyncAtividadeCrm$Params, context?: HttpContext): Observable<StrictHttpResponse<AtividadeCrm>> {
    return syncAtividadeCrm(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncAtividadeCrm$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncAtividadeCrm$Params, context?: HttpContext): Observable<AtividadeCrm> {
    return this.syncAtividadeCrm$Response(params, context).pipe(
      map((r: StrictHttpResponse<AtividadeCrm>): AtividadeCrm => r.body)
    );
  }

  /** Path part for operation `getByInternalIdAtividadeCrm()` */
  static readonly GetByInternalIdAtividadeCrmPath = '/AtividadeCrm/GetByInternalId';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getByInternalIdAtividadeCrm()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalIdAtividadeCrm$Response(params: GetByInternalIdAtividadeCrm$Params, context?: HttpContext): Observable<StrictHttpResponse<AtividadeCrm>> {
    return getByInternalIdAtividadeCrm(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getByInternalIdAtividadeCrm$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalId(params: GetByInternalIdAtividadeCrm$Params, context?: HttpContext): Observable<AtividadeCrm> {
    return this.getByInternalIdAtividadeCrm$Response(params, context).pipe(
      map((r: StrictHttpResponse<AtividadeCrm>): AtividadeCrm => r.body)
    );
  }

  /** Path part for operation `getListAtividadeCrm()` */
  static readonly GetListAtividadeCrmPath = '/AtividadeCrm/GetList';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListAtividadeCrm()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListAtividadeCrm$Response(params: GetListAtividadeCrm$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<AtividadeCrm>>> {
    return getListAtividadeCrm(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListAtividadeCrm$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListAtividadeCrm$Params, context?: HttpContext): Observable<Array<AtividadeCrm>> {
    return this.getListAtividadeCrm$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<AtividadeCrm>>): Array<AtividadeCrm> => r.body)
    );
  }

  /** Path part for operation `deleteAtividadeCrm()` */
  static readonly DeleteAtividadeCrmPath = '/AtividadeCrm/Delete';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `deleteAtividadeCrm()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  deleteAtividadeCrm$Response(params: DeleteAtividadeCrm$Params, context?: HttpContext): Observable<StrictHttpResponse<AtividadeCrm>> {
    return deleteAtividadeCrm(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `deleteAtividadeCrm$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  delete(params: DeleteAtividadeCrm$Params, context?: HttpContext): Observable<AtividadeCrm> {
    return this.deleteAtividadeCrm$Response(params, context).pipe(
      map((r: StrictHttpResponse<AtividadeCrm>): AtividadeCrm => r.body)
    );
  }

}
