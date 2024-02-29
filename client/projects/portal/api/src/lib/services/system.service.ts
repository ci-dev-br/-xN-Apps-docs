/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { leitura } from '../fn/system/leitura';
import { Leitura$Params } from '../fn/system/leitura';
import { Status } from '../models/status';

@Injectable({ providedIn: 'root' })
export class SystemService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `leitura()` */
  static readonly LeituraPath = '/System/Leitura';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `leitura()` instead.
   *
   * This method doesn't expect any request body.
   */
  leitura$Response(params?: Leitura$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<Status>>> {
    return leitura(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `leitura$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  leitura(params?: Leitura$Params, context?: HttpContext): Observable<Array<Status>> {
    return this.leitura$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<Status>>): Array<Status> => r.body)
    );
  }

}
