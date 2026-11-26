/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { Category } from '../models/category';
import { deleteCategory } from '../fn/category/delete-category';
import { DeleteCategory$Params } from '../fn/category/delete-category';
import { getByInternalIdCategory } from '../fn/category/get-by-internal-id-category';
import { GetByInternalIdCategory$Params } from '../fn/category/get-by-internal-id-category';
import { getListCategory } from '../fn/category/get-list-category';
import { GetListCategory$Params } from '../fn/category/get-list-category';
import { syncCategory } from '../fn/category/sync-category';
import { SyncCategory$Params } from '../fn/category/sync-category';
import { SyncPayloadDaoCategory } from '../models/sync-payload-dao-category';

@Injectable()
export class CategoryService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncCategory()` */
  static readonly SyncCategoryPath = '/Category/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncCategory()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncCategory$Response(params: SyncCategory$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDaoCategory>> {
    return syncCategory(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncCategory$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncCategory$Params, context?: HttpContext): Observable<SyncPayloadDaoCategory> {
    return this.syncCategory$Response(params, context).pipe(
      map((r: StrictHttpResponse<SyncPayloadDaoCategory>): SyncPayloadDaoCategory => r.body)
    );
  }

  /** Path part for operation `getByInternalIdCategory()` */
  static readonly GetByInternalIdCategoryPath = '/Category/GetByInternalId';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getByInternalIdCategory()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalIdCategory$Response(params: GetByInternalIdCategory$Params, context?: HttpContext): Observable<StrictHttpResponse<Category>> {
    return getByInternalIdCategory(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getByInternalIdCategory$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalId(params: GetByInternalIdCategory$Params, context?: HttpContext): Observable<Category> {
    return this.getByInternalIdCategory$Response(params, context).pipe(
      map((r: StrictHttpResponse<Category>): Category => r.body)
    );
  }

  /** Path part for operation `getListCategory()` */
  static readonly GetListCategoryPath = '/Category/GetList';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListCategory()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListCategory$Response(params: GetListCategory$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDaoCategory>> {
    return getListCategory(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListCategory$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListCategory$Params, context?: HttpContext): Observable<SyncPayloadDaoCategory> {
    return this.getListCategory$Response(params, context).pipe(
      map((r: StrictHttpResponse<SyncPayloadDaoCategory>): SyncPayloadDaoCategory => r.body)
    );
  }

  /** Path part for operation `deleteCategory()` */
  static readonly DeleteCategoryPath = '/Category/Delete';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `deleteCategory()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  deleteCategory$Response(params: DeleteCategory$Params, context?: HttpContext): Observable<StrictHttpResponse<Category>> {
    return deleteCategory(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `deleteCategory$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  delete(params: DeleteCategory$Params, context?: HttpContext): Observable<Category> {
    return this.deleteCategory$Response(params, context).pipe(
      map((r: StrictHttpResponse<Category>): Category => r.body)
    );
  }

}
