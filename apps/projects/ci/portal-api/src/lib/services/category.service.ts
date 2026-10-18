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
import { cetByInternalIdcategory } from '../fn/category/cet-by-internal-idcategory';
import { CetByInternalIdcategory$Params } from '../fn/category/cet-by-internal-idcategory';
import { cetListcategory } from '../fn/category/cet-listcategory';
import { CetListcategory$Params } from '../fn/category/cet-listcategory';
import { cynccategory } from '../fn/category/cynccategory';
import { Cynccategory$Params } from '../fn/category/cynccategory';
import { SyncPayloadDaoCategory } from '../models/sync-payload-dao-category';
import { RequestBuilder } from '../request-builder';
import { filter } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';

@Injectable()
export class CategoryService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `cynccategory()` */
  static readonly CynccategoryPath = '/Category/Sync';
  static readonly DeleteCategoryPath = '/Category/Delete';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `cynccategory()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  cynccategory$Response(params: Cynccategory$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDaoCategory>> {
    return cynccategory(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `cynccategory$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  cynccategory(params: Cynccategory$Params, context?: HttpContext): Observable<SyncPayloadDaoCategory> {
    return this.cynccategory$Response(params, context).pipe(
      map((r: StrictHttpResponse<SyncPayloadDaoCategory>): SyncPayloadDaoCategory => r.body)
    );
  }

  sync(params: Cynccategory$Params, context?: HttpContext): Observable<SyncPayloadDaoCategory> {
    return this.cynccategory(params, context);
  }

  /** Path part for operation `cetByInternalIdcategory()` */
  static readonly CetByInternalIdcategoryPath = '/Category/GetByInternalId';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `cetByInternalIdcategory()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  cetByInternalIdcategory$Response(params: CetByInternalIdcategory$Params, context?: HttpContext): Observable<StrictHttpResponse<Category>> {
    return cetByInternalIdcategory(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `cetByInternalIdcategory$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  cetByInternalIdcategory(params: CetByInternalIdcategory$Params, context?: HttpContext): Observable<Category> {
    return this.cetByInternalIdcategory$Response(params, context).pipe(
      map((r: StrictHttpResponse<Category>): Category => r.body)
    );
  }

  getByInternalId(params: CetByInternalIdcategory$Params, context?: HttpContext): Observable<Category> {
    return this.cetByInternalIdcategory(params, context);
  }

  /** Path part for operation `cetListcategory()` */
  static readonly CetListcategoryPath = '/Category/GetList';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `cetListcategory()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  cetListcategory$Response(params: CetListcategory$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDaoCategory>> {
    return cetListcategory(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `cetListcategory$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  cetListcategory(params: CetListcategory$Params, context?: HttpContext): Observable<SyncPayloadDaoCategory> {
    return this.cetListcategory$Response(params, context).pipe(
      map((r: StrictHttpResponse<SyncPayloadDaoCategory>): SyncPayloadDaoCategory => r.body)
    );
  }

  getList(params: CetListcategory$Params, context?: HttpContext): Observable<SyncPayloadDaoCategory> {
    return this.cetListcategory(params, context);
  }

  delete(params: { body: Category }, context?: HttpContext): Observable<Category> {
    const rb = new RequestBuilder(this.rootUrl, CategoryService.DeleteCategoryPath, 'post');
    if (params) rb.body(params.body, 'application/json');
    return this.http.request(rb.build({ responseType: 'json', accept: 'application/json', context })).pipe(
      filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => (r as StrictHttpResponse<Category>).body)
    );
  }

}
