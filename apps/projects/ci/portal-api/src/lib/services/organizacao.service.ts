/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { getByInternalIdOrganizacao } from '../fn/organizacao/get-by-internal-id-organizacao';
import { GetByInternalIdOrganizacao$Params } from '../fn/organizacao/get-by-internal-id-organizacao';
import { getListOrganizacao } from '../fn/organizacao/get-list-organizacao';
import { GetListOrganizacao$Params } from '../fn/organizacao/get-list-organizacao';
import { Organizacao } from '../models/organizacao';
import { syncOrganizacao } from '../fn/organizacao/sync-organizacao';
import { SyncOrganizacao$Params } from '../fn/organizacao/sync-organizacao';
import { SyncPayloadDaoOrganizacao } from '../models/sync-payload-dao-organizacao';

@Injectable()
export class OrganizacaoService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncOrganizacao()` */
  static readonly SyncOrganizacaoPath = '/Organizacao/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncOrganizacao()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncOrganizacao$Response(params: SyncOrganizacao$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDaoOrganizacao>> {
    return syncOrganizacao(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncOrganizacao$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncOrganizacao$Params, context?: HttpContext): Observable<SyncPayloadDaoOrganizacao> {
    return this.syncOrganizacao$Response(params, context).pipe(
      map((r: StrictHttpResponse<SyncPayloadDaoOrganizacao>): SyncPayloadDaoOrganizacao => r.body)
    );
  }

  /** Path part for operation `getByInternalIdOrganizacao()` */
  static readonly GetByInternalIdOrganizacaoPath = '/Organizacao/GetByInternalId';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getByInternalIdOrganizacao()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalIdOrganizacao$Response(params: GetByInternalIdOrganizacao$Params, context?: HttpContext): Observable<StrictHttpResponse<Organizacao>> {
    return getByInternalIdOrganizacao(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getByInternalIdOrganizacao$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalId(params: GetByInternalIdOrganizacao$Params, context?: HttpContext): Observable<Organizacao> {
    return this.getByInternalIdOrganizacao$Response(params, context).pipe(
      map((r: StrictHttpResponse<Organizacao>): Organizacao => r.body)
    );
  }

  /** Path part for operation `getListOrganizacao()` */
  static readonly GetListOrganizacaoPath = '/Organizacao/GetList';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListOrganizacao()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListOrganizacao$Response(params: GetListOrganizacao$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDaoOrganizacao>> {
    return getListOrganizacao(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListOrganizacao$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListOrganizacao$Params, context?: HttpContext): Observable<SyncPayloadDaoOrganizacao> {
    return this.getListOrganizacao$Response(params, context).pipe(
      map((r: StrictHttpResponse<SyncPayloadDaoOrganizacao>): SyncPayloadDaoOrganizacao => r.body)
    );
  }

}
