/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { deleteSeoTarefa } from '../fn/seo-tarefa/delete-seo-tarefa';
import { DeleteSeoTarefa$Params } from '../fn/seo-tarefa/delete-seo-tarefa';
import { getByInternalIdSeoTarefa } from '../fn/seo-tarefa/get-by-internal-id-seo-tarefa';
import { GetByInternalIdSeoTarefa$Params } from '../fn/seo-tarefa/get-by-internal-id-seo-tarefa';
import { getListSeoTarefa } from '../fn/seo-tarefa/get-list-seo-tarefa';
import { GetListSeoTarefa$Params } from '../fn/seo-tarefa/get-list-seo-tarefa';
import { SeoTarefa } from '../models/seo-tarefa';
import { syncSeoTarefa } from '../fn/seo-tarefa/sync-seo-tarefa';
import { SyncSeoTarefa$Params } from '../fn/seo-tarefa/sync-seo-tarefa';

@Injectable()
export class SeoTarefaService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncSeoTarefa()` */
  static readonly SyncSeoTarefaPath = '/SeoTarefa/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncSeoTarefa()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncSeoTarefa$Response(params: SyncSeoTarefa$Params, context?: HttpContext): Observable<StrictHttpResponse<SeoTarefa>> {
    return syncSeoTarefa(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncSeoTarefa$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncSeoTarefa$Params, context?: HttpContext): Observable<SeoTarefa> {
    return this.syncSeoTarefa$Response(params, context).pipe(
      map((r: StrictHttpResponse<SeoTarefa>): SeoTarefa => r.body)
    );
  }

  /** Path part for operation `getByInternalIdSeoTarefa()` */
  static readonly GetByInternalIdSeoTarefaPath = '/SeoTarefa/GetByInternalId';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getByInternalIdSeoTarefa()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalIdSeoTarefa$Response(params: GetByInternalIdSeoTarefa$Params, context?: HttpContext): Observable<StrictHttpResponse<SeoTarefa>> {
    return getByInternalIdSeoTarefa(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getByInternalIdSeoTarefa$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalId(params: GetByInternalIdSeoTarefa$Params, context?: HttpContext): Observable<SeoTarefa> {
    return this.getByInternalIdSeoTarefa$Response(params, context).pipe(
      map((r: StrictHttpResponse<SeoTarefa>): SeoTarefa => r.body)
    );
  }

  /** Path part for operation `getListSeoTarefa()` */
  static readonly GetListSeoTarefaPath = '/SeoTarefa/GetList';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListSeoTarefa()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListSeoTarefa$Response(params: GetListSeoTarefa$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<SeoTarefa>>> {
    return getListSeoTarefa(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListSeoTarefa$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListSeoTarefa$Params, context?: HttpContext): Observable<Array<SeoTarefa>> {
    return this.getListSeoTarefa$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<SeoTarefa>>): Array<SeoTarefa> => r.body)
    );
  }

  /** Path part for operation `deleteSeoTarefa()` */
  static readonly DeleteSeoTarefaPath = '/SeoTarefa/Delete';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `deleteSeoTarefa()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  deleteSeoTarefa$Response(params: DeleteSeoTarefa$Params, context?: HttpContext): Observable<StrictHttpResponse<SeoTarefa>> {
    return deleteSeoTarefa(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `deleteSeoTarefa$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  delete(params: DeleteSeoTarefa$Params, context?: HttpContext): Observable<SeoTarefa> {
    return this.deleteSeoTarefa$Response(params, context).pipe(
      map((r: StrictHttpResponse<SeoTarefa>): SeoTarefa => r.body)
    );
  }

}
