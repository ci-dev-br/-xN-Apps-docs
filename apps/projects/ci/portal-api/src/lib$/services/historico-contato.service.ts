/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { getListHistoricoContato } from '../fn/historico-contato/get-list-historico-contato';
import { GetListHistoricoContato$Params } from '../fn/historico-contato/get-list-historico-contato';
import { HistoricoContato } from '../models/historico-contato';
import { syncHistoricoContato } from '../fn/historico-contato/sync-historico-contato';
import { SyncHistoricoContato$Params } from '../fn/historico-contato/sync-historico-contato';

@Injectable()
export class HistoricoContatoService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncHistoricoContato()` */
  static readonly SyncHistoricoContatoPath = '/HistoricoContato/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncHistoricoContato()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncHistoricoContato$Response(params: SyncHistoricoContato$Params, context?: HttpContext): Observable<StrictHttpResponse<HistoricoContato>> {
    return syncHistoricoContato(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncHistoricoContato$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncHistoricoContato$Params, context?: HttpContext): Observable<HistoricoContato> {
    return this.syncHistoricoContato$Response(params, context).pipe(
      map((r: StrictHttpResponse<HistoricoContato>): HistoricoContato => r.body)
    );
  }

  /** Path part for operation `getListHistoricoContato()` */
  static readonly GetListHistoricoContatoPath = '/HistoricoContato/GetList';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListHistoricoContato()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListHistoricoContato$Response(params: GetListHistoricoContato$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<HistoricoContato>>> {
    return getListHistoricoContato(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListHistoricoContato$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListHistoricoContato$Params, context?: HttpContext): Observable<Array<HistoricoContato>> {
    return this.getListHistoricoContato$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<HistoricoContato>>): Array<HistoricoContato> => r.body)
    );
  }

}
