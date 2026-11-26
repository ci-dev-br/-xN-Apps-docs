/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { getListClienteProjeto } from '../fn/cliente-projeto/get-list-cliente-projeto';
import { GetListClienteProjeto$Params } from '../fn/cliente-projeto/get-list-cliente-projeto';
import { syncClienteProjeto } from '../fn/cliente-projeto/sync-cliente-projeto';
import { SyncClienteProjeto$Params } from '../fn/cliente-projeto/sync-cliente-projeto';
import { SyncPayloadDaoClienteProjeto } from '../models/sync-payload-dao-cliente-projeto';

@Injectable()
export class ClienteProjetoService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncClienteProjeto()` */
  static readonly SyncClienteProjetoPath = '/ClienteProjeto/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncClienteProjeto()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncClienteProjeto$Response(params: SyncClienteProjeto$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDaoClienteProjeto>> {
    return syncClienteProjeto(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncClienteProjeto$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncClienteProjeto$Params, context?: HttpContext): Observable<SyncPayloadDaoClienteProjeto> {
    return this.syncClienteProjeto$Response(params, context).pipe(
      map((r: StrictHttpResponse<SyncPayloadDaoClienteProjeto>): SyncPayloadDaoClienteProjeto => r.body)
    );
  }

  /** Path part for operation `getListClienteProjeto()` */
  static readonly GetListClienteProjetoPath = '/ClienteProjeto/GetList';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListClienteProjeto()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListClienteProjeto$Response(params: GetListClienteProjeto$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDaoClienteProjeto>> {
    return getListClienteProjeto(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListClienteProjeto$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListClienteProjeto$Params, context?: HttpContext): Observable<SyncPayloadDaoClienteProjeto> {
    return this.getListClienteProjeto$Response(params, context).pipe(
      map((r: StrictHttpResponse<SyncPayloadDaoClienteProjeto>): SyncPayloadDaoClienteProjeto => r.body)
    );
  }

}
