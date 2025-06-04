/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { getListProjeto } from '../fn/projeto/get-list-projeto';
import { GetListProjeto$Params } from '../fn/projeto/get-list-projeto';
import { SyncPayloadDaoProjeto } from '../models/sync-payload-dao-projeto';
import { syncProjeto } from '../fn/projeto/sync-projeto';
import { SyncProjeto$Params } from '../fn/projeto/sync-projeto';

@Injectable()
export class ProjetoService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncProjeto()` */
  static readonly SyncProjetoPath = '/Projeto/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncProjeto()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncProjeto$Response(params: SyncProjeto$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDaoProjeto>> {
    return syncProjeto(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncProjeto$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncProjeto$Params, context?: HttpContext): Observable<SyncPayloadDaoProjeto> {
    return this.syncProjeto$Response(params, context).pipe(
      map((r: StrictHttpResponse<SyncPayloadDaoProjeto>): SyncPayloadDaoProjeto => r.body)
    );
  }

  /** Path part for operation `getListProjeto()` */
  static readonly GetListProjetoPath = '/Projeto/GetList';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListProjeto()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListProjeto$Response(params: GetListProjeto$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDaoProjeto>> {
    return getListProjeto(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListProjeto$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListProjeto$Params, context?: HttpContext): Observable<SyncPayloadDaoProjeto> {
    return this.getListProjeto$Response(params, context).pipe(
      map((r: StrictHttpResponse<SyncPayloadDaoProjeto>): SyncPayloadDaoProjeto => r.body)
    );
  }

}
