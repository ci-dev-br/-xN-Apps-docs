/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { deleteInstrutor } from '../fn/instrutor/delete-instrutor';
import { DeleteInstrutor$Params } from '../fn/instrutor/delete-instrutor';
import { getByInternalIdInstrutor } from '../fn/instrutor/get-by-internal-id-instrutor';
import { GetByInternalIdInstrutor$Params } from '../fn/instrutor/get-by-internal-id-instrutor';
import { getListInstrutor } from '../fn/instrutor/get-list-instrutor';
import { GetListInstrutor$Params } from '../fn/instrutor/get-list-instrutor';
import { Instrutor } from '../models/instrutor';
import { meuPerfilInstrutor } from '../fn/instrutor/meu-perfil-instrutor';
import { MeuPerfilInstrutor$Params } from '../fn/instrutor/meu-perfil-instrutor';
import { syncInstrutor } from '../fn/instrutor/sync-instrutor';
import { SyncInstrutor$Params } from '../fn/instrutor/sync-instrutor';

@Injectable()
export class InstrutorService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncInstrutor()` */
  static readonly SyncInstrutorPath = '/Instrutor/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncInstrutor()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncInstrutor$Response(params: SyncInstrutor$Params, context?: HttpContext): Observable<StrictHttpResponse<Instrutor>> {
    return syncInstrutor(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncInstrutor$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncInstrutor$Params, context?: HttpContext): Observable<Instrutor> {
    return this.syncInstrutor$Response(params, context).pipe(
      map((r: StrictHttpResponse<Instrutor>): Instrutor => r.body)
    );
  }

  /** Path part for operation `getByInternalIdInstrutor()` */
  static readonly GetByInternalIdInstrutorPath = '/Instrutor/GetByInternalId';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getByInternalIdInstrutor()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalIdInstrutor$Response(params: GetByInternalIdInstrutor$Params, context?: HttpContext): Observable<StrictHttpResponse<Instrutor>> {
    return getByInternalIdInstrutor(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getByInternalIdInstrutor$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalId(params: GetByInternalIdInstrutor$Params, context?: HttpContext): Observable<Instrutor> {
    return this.getByInternalIdInstrutor$Response(params, context).pipe(
      map((r: StrictHttpResponse<Instrutor>): Instrutor => r.body)
    );
  }

  /** Path part for operation `getListInstrutor()` */
  static readonly GetListInstrutorPath = '/Instrutor/GetList';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListInstrutor()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListInstrutor$Response(params: GetListInstrutor$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<Instrutor>>> {
    return getListInstrutor(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListInstrutor$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListInstrutor$Params, context?: HttpContext): Observable<Array<Instrutor>> {
    return this.getListInstrutor$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<Instrutor>>): Array<Instrutor> => r.body)
    );
  }

  /** Path part for operation `deleteInstrutor()` */
  static readonly DeleteInstrutorPath = '/Instrutor/Delete';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `deleteInstrutor()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  deleteInstrutor$Response(params: DeleteInstrutor$Params, context?: HttpContext): Observable<StrictHttpResponse<Instrutor>> {
    return deleteInstrutor(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `deleteInstrutor$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  delete(params: DeleteInstrutor$Params, context?: HttpContext): Observable<Instrutor> {
    return this.deleteInstrutor$Response(params, context).pipe(
      map((r: StrictHttpResponse<Instrutor>): Instrutor => r.body)
    );
  }

  /** Path part for operation `meuPerfilInstrutor()` */
  static readonly MeuPerfilInstrutorPath = '/Instrutor/MeuPerfil';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `meuPerfilInstrutor()` instead.
   *
   * This method doesn't expect any request body.
   */
  meuPerfilInstrutor$Response(params?: MeuPerfilInstrutor$Params, context?: HttpContext): Observable<StrictHttpResponse<Instrutor>> {
    return meuPerfilInstrutor(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `meuPerfilInstrutor$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  meuPerfil(params?: MeuPerfilInstrutor$Params, context?: HttpContext): Observable<Instrutor> {
    return this.meuPerfilInstrutor$Response(params, context).pipe(
      map((r: StrictHttpResponse<Instrutor>): Instrutor => r.body)
    );
  }

}
