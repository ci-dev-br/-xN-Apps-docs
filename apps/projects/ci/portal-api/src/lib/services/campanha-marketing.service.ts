/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { CampanhaMarketing } from '../models/campanha-marketing';
import { deleteCampanhaMarketing } from '../fn/campanha-marketing/delete-campanha-marketing';
import { DeleteCampanhaMarketing$Params } from '../fn/campanha-marketing/delete-campanha-marketing';
import { getByInternalIdCampanhaMarketing } from '../fn/campanha-marketing/get-by-internal-id-campanha-marketing';
import { GetByInternalIdCampanhaMarketing$Params } from '../fn/campanha-marketing/get-by-internal-id-campanha-marketing';
import { getListCampanhaMarketing } from '../fn/campanha-marketing/get-list-campanha-marketing';
import { GetListCampanhaMarketing$Params } from '../fn/campanha-marketing/get-list-campanha-marketing';
import { syncCampanhaMarketing } from '../fn/campanha-marketing/sync-campanha-marketing';
import { SyncCampanhaMarketing$Params } from '../fn/campanha-marketing/sync-campanha-marketing';

@Injectable()
export class CampanhaMarketingService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncCampanhaMarketing()` */
  static readonly SyncCampanhaMarketingPath = '/CampanhaMarketing/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncCampanhaMarketing()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncCampanhaMarketing$Response(params: SyncCampanhaMarketing$Params, context?: HttpContext): Observable<StrictHttpResponse<CampanhaMarketing>> {
    return syncCampanhaMarketing(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncCampanhaMarketing$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncCampanhaMarketing$Params, context?: HttpContext): Observable<CampanhaMarketing> {
    return this.syncCampanhaMarketing$Response(params, context).pipe(
      map((r: StrictHttpResponse<CampanhaMarketing>): CampanhaMarketing => r.body)
    );
  }

  /** Path part for operation `getByInternalIdCampanhaMarketing()` */
  static readonly GetByInternalIdCampanhaMarketingPath = '/CampanhaMarketing/GetByInternalId';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getByInternalIdCampanhaMarketing()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalIdCampanhaMarketing$Response(params: GetByInternalIdCampanhaMarketing$Params, context?: HttpContext): Observable<StrictHttpResponse<CampanhaMarketing>> {
    return getByInternalIdCampanhaMarketing(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getByInternalIdCampanhaMarketing$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalId(params: GetByInternalIdCampanhaMarketing$Params, context?: HttpContext): Observable<CampanhaMarketing> {
    return this.getByInternalIdCampanhaMarketing$Response(params, context).pipe(
      map((r: StrictHttpResponse<CampanhaMarketing>): CampanhaMarketing => r.body)
    );
  }

  /** Path part for operation `getListCampanhaMarketing()` */
  static readonly GetListCampanhaMarketingPath = '/CampanhaMarketing/GetList';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListCampanhaMarketing()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListCampanhaMarketing$Response(params: GetListCampanhaMarketing$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<CampanhaMarketing>>> {
    return getListCampanhaMarketing(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListCampanhaMarketing$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListCampanhaMarketing$Params, context?: HttpContext): Observable<Array<CampanhaMarketing>> {
    return this.getListCampanhaMarketing$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<CampanhaMarketing>>): Array<CampanhaMarketing> => r.body)
    );
  }

  /** Path part for operation `deleteCampanhaMarketing()` */
  static readonly DeleteCampanhaMarketingPath = '/CampanhaMarketing/Delete';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `deleteCampanhaMarketing()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  deleteCampanhaMarketing$Response(params: DeleteCampanhaMarketing$Params, context?: HttpContext): Observable<StrictHttpResponse<CampanhaMarketing>> {
    return deleteCampanhaMarketing(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `deleteCampanhaMarketing$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  delete(params: DeleteCampanhaMarketing$Params, context?: HttpContext): Observable<CampanhaMarketing> {
    return this.deleteCampanhaMarketing$Response(params, context).pipe(
      map((r: StrictHttpResponse<CampanhaMarketing>): CampanhaMarketing => r.body)
    );
  }

}
