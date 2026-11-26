/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { novaChamada } from '../fn/chamada/nova-chamada';
import { NovaChamada$Params } from '../fn/chamada/nova-chamada';

@Injectable()
export class ChamadaService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `novaChamada()` */
  static readonly NovaChamadaPath = '/Chamada/NovaChamada';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `novaChamada()` instead.
   *
   * This method doesn't expect any request body.
   */
  novaChamada$Response(params?: NovaChamada$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return novaChamada(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `novaChamada$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  nova(params?: NovaChamada$Params, context?: HttpContext): Observable<void> {
    return this.novaChamada$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

}
