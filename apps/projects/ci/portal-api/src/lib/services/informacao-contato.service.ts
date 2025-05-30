/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { getListInformacaoContato } from '../fn/informacao-contato/get-list-informacao-contato';
import { GetListInformacaoContato$Params } from '../fn/informacao-contato/get-list-informacao-contato';
import { syncInformacaoContato } from '../fn/informacao-contato/sync-informacao-contato';
import { SyncInformacaoContato$Params } from '../fn/informacao-contato/sync-informacao-contato';
import { SyncPayloadDaoInformacaoContato } from '../models/sync-payload-dao-informacao-contato';

@Injectable()
export class InformacaoContatoService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncInformacaoContato()` */
  static readonly SyncInformacaoContatoPath = '/InformacaoContato/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncInformacaoContato()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncInformacaoContato$Response(params: SyncInformacaoContato$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDaoInformacaoContato>> {
    return syncInformacaoContato(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncInformacaoContato$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncInformacaoContato$Params, context?: HttpContext): Observable<SyncPayloadDaoInformacaoContato> {
    return this.syncInformacaoContato$Response(params, context).pipe(
      map((r: StrictHttpResponse<SyncPayloadDaoInformacaoContato>): SyncPayloadDaoInformacaoContato => r.body)
    );
  }

  /** Path part for operation `getListInformacaoContato()` */
  static readonly GetListInformacaoContatoPath = '/InformacaoContato/GetList';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListInformacaoContato()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListInformacaoContato$Response(params: GetListInformacaoContato$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDaoInformacaoContato>> {
    return getListInformacaoContato(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListInformacaoContato$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListInformacaoContato$Params, context?: HttpContext): Observable<SyncPayloadDaoInformacaoContato> {
    return this.getListInformacaoContato$Response(params, context).pipe(
      map((r: StrictHttpResponse<SyncPayloadDaoInformacaoContato>): SyncPayloadDaoInformacaoContato => r.body)
    );
  }

}
