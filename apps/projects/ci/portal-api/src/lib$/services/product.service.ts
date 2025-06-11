/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { getListProduct } from '../fn/product/get-list-product';
import { GetListProduct$Params } from '../fn/product/get-list-product';
import { Product } from '../models/product';
import { SyncPayloadDaoProduct } from '../models/sync-payload-dao-product';
import { syncProduct } from '../fn/product/sync-product';
import { SyncProduct$Params } from '../fn/product/sync-product';

@Injectable()
export class ProductService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncProduct()` */
  static readonly SyncProductPath = '/Product/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncProduct()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncProduct$Response(params: SyncProduct$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDaoProduct>> {
    return syncProduct(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncProduct$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncProduct$Params, context?: HttpContext): Observable<SyncPayloadDaoProduct> {
    return this.syncProduct$Response(params, context).pipe(
      map((r: StrictHttpResponse<SyncPayloadDaoProduct>): SyncPayloadDaoProduct => r.body)
    );
  }

  /** Path part for operation `getListProduct()` */
  static readonly GetListProductPath = '/Product/Get';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListProduct()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListProduct$Response(params: GetListProduct$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<Product>>> {
    return getListProduct(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListProduct$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListProduct$Params, context?: HttpContext): Observable<Array<Product>> {
    return this.getListProduct$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<Product>>): Array<Product> => r.body)
    );
  }

}
