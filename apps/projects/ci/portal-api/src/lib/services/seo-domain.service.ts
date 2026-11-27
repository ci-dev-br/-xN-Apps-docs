/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { deleteSeoDomain } from '../fn/seo-domain/delete-seo-domain';
import { DeleteSeoDomain$Params } from '../fn/seo-domain/delete-seo-domain';
import { getByInternalIdSeoDomain } from '../fn/seo-domain/get-by-internal-id-seo-domain';
import { GetByInternalIdSeoDomain$Params } from '../fn/seo-domain/get-by-internal-id-seo-domain';
import { getListSeoDomain } from '../fn/seo-domain/get-list-seo-domain';
import { GetListSeoDomain$Params } from '../fn/seo-domain/get-list-seo-domain';
import { SeoDomain } from '../models/seo-domain';
import { syncSeoDomain } from '../fn/seo-domain/sync-seo-domain';
import { SyncSeoDomain$Params } from '../fn/seo-domain/sync-seo-domain';

@Injectable()
export class SeoDomainService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncSeoDomain()` */
  static readonly SyncSeoDomainPath = '/SeoDomain/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncSeoDomain()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncSeoDomain$Response(params: SyncSeoDomain$Params, context?: HttpContext): Observable<StrictHttpResponse<SeoDomain>> {
    return syncSeoDomain(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncSeoDomain$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncSeoDomain$Params, context?: HttpContext): Observable<SeoDomain> {
    return this.syncSeoDomain$Response(params, context).pipe(
      map((r: StrictHttpResponse<SeoDomain>): SeoDomain => r.body)
    );
  }

  /** Path part for operation `getByInternalIdSeoDomain()` */
  static readonly GetByInternalIdSeoDomainPath = '/SeoDomain/GetByInternalId';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getByInternalIdSeoDomain()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalIdSeoDomain$Response(params: GetByInternalIdSeoDomain$Params, context?: HttpContext): Observable<StrictHttpResponse<SeoDomain>> {
    return getByInternalIdSeoDomain(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getByInternalIdSeoDomain$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalId(params: GetByInternalIdSeoDomain$Params, context?: HttpContext): Observable<SeoDomain> {
    return this.getByInternalIdSeoDomain$Response(params, context).pipe(
      map((r: StrictHttpResponse<SeoDomain>): SeoDomain => r.body)
    );
  }

  /** Path part for operation `getListSeoDomain()` */
  static readonly GetListSeoDomainPath = '/SeoDomain/GetList';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListSeoDomain()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListSeoDomain$Response(params: GetListSeoDomain$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<SeoDomain>>> {
    return getListSeoDomain(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListSeoDomain$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListSeoDomain$Params, context?: HttpContext): Observable<Array<SeoDomain>> {
    return this.getListSeoDomain$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<SeoDomain>>): Array<SeoDomain> => r.body)
    );
  }

  /** Path part for operation `deleteSeoDomain()` */
  static readonly DeleteSeoDomainPath = '/SeoDomain/Delete';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `deleteSeoDomain()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  deleteSeoDomain$Response(params: DeleteSeoDomain$Params, context?: HttpContext): Observable<StrictHttpResponse<SeoDomain>> {
    return deleteSeoDomain(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `deleteSeoDomain$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  delete(params: DeleteSeoDomain$Params, context?: HttpContext): Observable<SeoDomain> {
    return this.deleteSeoDomain$Response(params, context).pipe(
      map((r: StrictHttpResponse<SeoDomain>): SeoDomain => r.body)
    );
  }

}
