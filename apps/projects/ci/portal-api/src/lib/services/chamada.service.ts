 /* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { chamadaControllerNovaChamada } from '../fn/chamada/chamada-controller-nova-chamada';
import { ChamadaControllerNovaChamada$Params } from '../fn/chamada/chamada-controller-nova-chamada';

@Injectable()
export class ChamadaService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `chamadaControllerNovaChamada()` */
  static readonly ChamadaControllerNovaChamadaPath = '/Chamada/NovaChamada';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `chamadaControllerNovaChamada()` instead.
   *
   * This method doesn't expect any request body.
   */
  chamadaControllerNovaChamada$Response(params?: ChamadaControllerNovaChamada$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return chamadaControllerNovaChamada(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `chamadaControllerNovaChamada$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  chamadaControllerNova(params?: ChamadaControllerNovaChamada$Params, context?: HttpContext): Observable<void> {
    return this.chamadaControllerNovaChamada$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

}
