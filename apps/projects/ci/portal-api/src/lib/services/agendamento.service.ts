/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { Agendamento } from '../models/agendamento';
import { deleteAgendamento } from '../fn/agendamento/delete-agendamento';
import { DeleteAgendamento$Params } from '../fn/agendamento/delete-agendamento';
import { getByInternalIdAgendamento } from '../fn/agendamento/get-by-internal-id-agendamento';
import { GetByInternalIdAgendamento$Params } from '../fn/agendamento/get-by-internal-id-agendamento';
import { getListAgendamento } from '../fn/agendamento/get-list-agendamento';
import { GetListAgendamento$Params } from '../fn/agendamento/get-list-agendamento';
import { syncAgendamento } from '../fn/agendamento/sync-agendamento';
import { SyncAgendamento$Params } from '../fn/agendamento/sync-agendamento';

@Injectable()
export class AgendamentoService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncAgendamento()` */
  static readonly SyncAgendamentoPath = '/Agendamento/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncAgendamento()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncAgendamento$Response(params: SyncAgendamento$Params, context?: HttpContext): Observable<StrictHttpResponse<Agendamento>> {
    return syncAgendamento(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncAgendamento$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncAgendamento$Params, context?: HttpContext): Observable<Agendamento> {
    return this.syncAgendamento$Response(params, context).pipe(
      map((r: StrictHttpResponse<Agendamento>): Agendamento => r.body)
    );
  }

  /** Path part for operation `getByInternalIdAgendamento()` */
  static readonly GetByInternalIdAgendamentoPath = '/Agendamento/GetByInternalId';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getByInternalIdAgendamento()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalIdAgendamento$Response(params: GetByInternalIdAgendamento$Params, context?: HttpContext): Observable<StrictHttpResponse<Agendamento>> {
    return getByInternalIdAgendamento(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getByInternalIdAgendamento$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalId(params: GetByInternalIdAgendamento$Params, context?: HttpContext): Observable<Agendamento> {
    return this.getByInternalIdAgendamento$Response(params, context).pipe(
      map((r: StrictHttpResponse<Agendamento>): Agendamento => r.body)
    );
  }

  /** Path part for operation `getListAgendamento()` */
  static readonly GetListAgendamentoPath = '/Agendamento/GetList';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListAgendamento()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListAgendamento$Response(params: GetListAgendamento$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<Agendamento>>> {
    return getListAgendamento(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListAgendamento$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListAgendamento$Params, context?: HttpContext): Observable<Array<Agendamento>> {
    return this.getListAgendamento$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<Agendamento>>): Array<Agendamento> => r.body)
    );
  }

  /** Path part for operation `deleteAgendamento()` */
  static readonly DeleteAgendamentoPath = '/Agendamento/Delete';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `deleteAgendamento()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  deleteAgendamento$Response(params: DeleteAgendamento$Params, context?: HttpContext): Observable<StrictHttpResponse<Agendamento>> {
    return deleteAgendamento(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `deleteAgendamento$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  delete(params: DeleteAgendamento$Params, context?: HttpContext): Observable<Agendamento> {
    return this.deleteAgendamento$Response(params, context).pipe(
      map((r: StrictHttpResponse<Agendamento>): Agendamento => r.body)
    );
  }

}
