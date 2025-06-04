/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { Atendimento } from '../models/atendimento';
import { getListAtendimento } from '../fn/atendimento/get-list-atendimento';
import { GetListAtendimento$Params } from '../fn/atendimento/get-list-atendimento';
import { syncAtendimento } from '../fn/atendimento/sync-atendimento';
import { SyncAtendimento$Params } from '../fn/atendimento/sync-atendimento';

@Injectable()
export class AtendimentoService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncAtendimento()` */
  static readonly SyncAtendimentoPath = '/Atendimento/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncAtendimento()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncAtendimento$Response(params: SyncAtendimento$Params, context?: HttpContext): Observable<StrictHttpResponse<Atendimento>> {
    return syncAtendimento(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncAtendimento$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncAtendimento$Params, context?: HttpContext): Observable<Atendimento> {
    return this.syncAtendimento$Response(params, context).pipe(
      map((r: StrictHttpResponse<Atendimento>): Atendimento => r.body)
    );
  }

  /** Path part for operation `getListAtendimento()` */
  static readonly GetListAtendimentoPath = '/Atendimento/GetList';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListAtendimento()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListAtendimento$Response(params: GetListAtendimento$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<Atendimento>>> {
    return getListAtendimento(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListAtendimento$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListAtendimento$Params, context?: HttpContext): Observable<Array<Atendimento>> {
    return this.getListAtendimento$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<Atendimento>>): Array<Atendimento> => r.body)
    );
  }

}
