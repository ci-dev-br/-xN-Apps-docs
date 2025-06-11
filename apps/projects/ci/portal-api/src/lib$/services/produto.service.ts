/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { getListProduto } from '../fn/produto/get-list-produto';
import { GetListProduto$Params } from '../fn/produto/get-list-produto';
import { Produto } from '../models/produto';
import { syncProduto } from '../fn/produto/sync-produto';
import { SyncProduto$Params } from '../fn/produto/sync-produto';

@Injectable()
export class ProdutoService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncProduto()` */
  static readonly SyncProdutoPath = '/Produto/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncProduto()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncProduto$Response(params: SyncProduto$Params, context?: HttpContext): Observable<StrictHttpResponse<Produto>> {
    return syncProduto(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncProduto$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncProduto$Params, context?: HttpContext): Observable<Produto> {
    return this.syncProduto$Response(params, context).pipe(
      map((r: StrictHttpResponse<Produto>): Produto => r.body)
    );
  }

  /** Path part for operation `getListProduto()` */
  static readonly GetListProdutoPath = '/Produto/GetList';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListProduto()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListProduto$Response(params: GetListProduto$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<Produto>>> {
    return getListProduto(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListProduto$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListProduto$Params, context?: HttpContext): Observable<Array<Produto>> {
    return this.getListProduto$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<Produto>>): Array<Produto> => r.body)
    );
  }

}
