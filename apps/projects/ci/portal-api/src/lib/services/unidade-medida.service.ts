/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { UnidadeMedida } from '../models/unidade-medida';
import { unidadeMedidaGet } from '../fn/unidade-medida/unidade-medida-get';
import { UnidadeMedidaGet$Params } from '../fn/unidade-medida/unidade-medida-get';
import { unidadeMedidaSync } from '../fn/unidade-medida/unidade-medida-sync';
import { UnidadeMedidaSync$Params } from '../fn/unidade-medida/unidade-medida-sync';

@Injectable()
export class UnidadeMedidaService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `unidadeMedidaSync()` */
  static readonly UnidadeMedidaSyncPath = '/UnidadeMedida/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `unidadeMedidaSync()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  unidadeMedidaSync$Response(params: UnidadeMedidaSync$Params, context?: HttpContext): Observable<StrictHttpResponse<UnidadeMedida>> {
    return unidadeMedidaSync(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `unidadeMedidaSync$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  unidadeMedidaSync(params: UnidadeMedidaSync$Params, context?: HttpContext): Observable<UnidadeMedida> {
    return this.unidadeMedidaSync$Response(params, context).pipe(
      map((r: StrictHttpResponse<UnidadeMedida>): UnidadeMedida => r.body)
    );
  }

  /** Path part for operation `unidadeMedidaGet()` */
  static readonly UnidadeMedidaGetPath = '/UnidadeMedida/Get';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `unidadeMedidaGet()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  unidadeMedidaGet$Response(params: UnidadeMedidaGet$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<UnidadeMedida>>> {
    return unidadeMedidaGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `unidadeMedidaGet$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  unidadeMedidaGet(params: UnidadeMedidaGet$Params, context?: HttpContext): Observable<Array<UnidadeMedida>> {
    return this.unidadeMedidaGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<UnidadeMedida>>): Array<UnidadeMedida> => r.body)
    );
  }

}
