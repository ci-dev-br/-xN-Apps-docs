/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { getListPais } from '../fn/pais/get-list-pais';
import { GetListPais$Params } from '../fn/pais/get-list-pais';
import { Pais } from '../models/pais';
import { syncPais } from '../fn/pais/sync-pais';
import { SyncPais$Params } from '../fn/pais/sync-pais';

@Injectable()
export class PaisService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncPais()` */
  static readonly SyncPaisPath = '/Pais/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncPais()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncPais$Response(params: SyncPais$Params, context?: HttpContext): Observable<StrictHttpResponse<Pais>> {
    return syncPais(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncPais$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncPais$Params, context?: HttpContext): Observable<Pais> {
    return this.syncPais$Response(params, context).pipe(
      map((r: StrictHttpResponse<Pais>): Pais => r.body)
    );
  }

  /** Path part for operation `getListPais()` */
  static readonly GetListPaisPath = '/Pais/GetList';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListPais()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListPais$Response(params: GetListPais$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<Pais>>> {
    return getListPais(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListPais$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListPais$Params, context?: HttpContext): Observable<Array<Pais>> {
    return this.getListPais$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<Pais>>): Array<Pais> => r.body)
    );
  }

}
