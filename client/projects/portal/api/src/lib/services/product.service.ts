/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { productGet } from '../fn/product/product-get';
import { ProductGet$Params } from '../fn/product/product-get';
import { productSync } from '../fn/product/product-sync';
import { ProductSync$Params } from '../fn/product/product-sync';
import { SyncPayloadDaoProduct } from '../models/sync-payload-dao-product';

@Injectable({ providedIn: 'root' })
export class ProductService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `productSync()` */
  static readonly ProductSyncPath = '/Product/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `productSync()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  productSync$Response(params: ProductSync$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDaoProduct>> {
    return productSync(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `productSync$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  productSync(params: ProductSync$Params, context?: HttpContext): Observable<SyncPayloadDaoProduct> {
    return this.productSync$Response(params, context).pipe(
      map((r: StrictHttpResponse<SyncPayloadDaoProduct>): SyncPayloadDaoProduct => r.body)
    );
  }

  /** Path part for operation `productGet()` */
  static readonly ProductGetPath = '/Product/Get';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `productGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  productGet$Response(params?: ProductGet$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDaoProduct>> {
    return productGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `productGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  productGet(params?: ProductGet$Params, context?: HttpContext): Observable<SyncPayloadDaoProduct> {
    return this.productGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<SyncPayloadDaoProduct>): SyncPayloadDaoProduct => r.body)
    );
  }

}
