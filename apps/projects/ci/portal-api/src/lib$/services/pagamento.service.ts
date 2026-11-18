/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { getListPagamento } from '../fn/pagamento/get-list-pagamento';
import { GetListPagamento$Params } from '../fn/pagamento/get-list-pagamento';
import { Pagamento } from '../models/pagamento';
import { syncPagamento } from '../fn/pagamento/sync-pagamento';
import { SyncPagamento$Params } from '../fn/pagamento/sync-pagamento';

@Injectable()
export class PagamentoService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncPagamento()` */
  static readonly SyncPagamentoPath = '/Pagamento/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncPagamento()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncPagamento$Response(params: SyncPagamento$Params, context?: HttpContext): Observable<StrictHttpResponse<Pagamento>> {
    return syncPagamento(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncPagamento$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncPagamento$Params, context?: HttpContext): Observable<Pagamento> {
    return this.syncPagamento$Response(params, context).pipe(
      map((r: StrictHttpResponse<Pagamento>): Pagamento => r.body)
    );
  }

  /** Path part for operation `getListPagamento()` */
  static readonly GetListPagamentoPath = '/Pagamento/GetList';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListPagamento()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListPagamento$Response(params: GetListPagamento$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<Pagamento>>> {
    return getListPagamento(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListPagamento$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListPagamento$Params, context?: HttpContext): Observable<Array<Pagamento>> {
    return this.getListPagamento$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<Pagamento>>): Array<Pagamento> => r.body)
    );
  }

}
