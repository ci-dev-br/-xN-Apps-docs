/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { Pais } from '../models/pais';
import { paisGet } from '../fn/pais/pais-get';
import { PaisGet$Params } from '../fn/pais/pais-get';
import { paisSync } from '../fn/pais/pais-sync';
import { PaisSync$Params } from '../fn/pais/pais-sync';

@Injectable()
export class PaisService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `paisSync()` */
  static readonly PaisSyncPath = '/Pais/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `paisSync()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  paisSync$Response(params: PaisSync$Params, context?: HttpContext): Observable<StrictHttpResponse<Pais>> {
    return paisSync(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `paisSync$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  paisSync(params: PaisSync$Params, context?: HttpContext): Observable<Pais> {
    return this.paisSync$Response(params, context).pipe(
      map((r: StrictHttpResponse<Pais>): Pais => r.body)
    );
  }

  /** Path part for operation `paisGet()` */
  static readonly PaisGetPath = '/Pais/Get';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `paisGet()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  paisGet$Response(params: PaisGet$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<Pais>>> {
    return paisGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `paisGet$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  paisGet(params: PaisGet$Params, context?: HttpContext): Observable<Array<Pais>> {
    return this.paisGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<Pais>>): Array<Pais> => r.body)
    );
  }

}
