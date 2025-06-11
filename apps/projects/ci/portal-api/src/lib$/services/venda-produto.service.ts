/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { getListVendaProduto } from '../fn/venda-produto/get-list-venda-produto';
import { GetListVendaProduto$Params } from '../fn/venda-produto/get-list-venda-produto';
import { syncVendaProduto } from '../fn/venda-produto/sync-venda-produto';
import { SyncVendaProduto$Params } from '../fn/venda-produto/sync-venda-produto';
import { VendaProduto } from '../models/venda-produto';

@Injectable()
export class VendaProdutoService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncVendaProduto()` */
  static readonly SyncVendaProdutoPath = '/VendaProduto/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncVendaProduto()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncVendaProduto$Response(params: SyncVendaProduto$Params, context?: HttpContext): Observable<StrictHttpResponse<VendaProduto>> {
    return syncVendaProduto(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncVendaProduto$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncVendaProduto$Params, context?: HttpContext): Observable<VendaProduto> {
    return this.syncVendaProduto$Response(params, context).pipe(
      map((r: StrictHttpResponse<VendaProduto>): VendaProduto => r.body)
    );
  }

  /** Path part for operation `getListVendaProduto()` */
  static readonly GetListVendaProdutoPath = '/VendaProduto/GetList';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListVendaProduto()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListVendaProduto$Response(params: GetListVendaProduto$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<VendaProduto>>> {
    return getListVendaProduto(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListVendaProduto$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListVendaProduto$Params, context?: HttpContext): Observable<Array<VendaProduto>> {
    return this.getListVendaProduto$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<VendaProduto>>): Array<VendaProduto> => r.body)
    );
  }

}
