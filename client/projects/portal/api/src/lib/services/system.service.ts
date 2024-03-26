/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { CpuInfo } from '../models/cpu-info';
import { systemLeitura } from '../fn/system/system-leitura';
import { SystemLeitura$Params } from '../fn/system/system-leitura';

@Injectable({ providedIn: 'root' })
export class SystemService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `systemLeitura()` */
  static readonly SystemLeituraPath = '/System/Leitura';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `systemLeitura()` instead.
   *
   * This method doesn't expect any request body.
   */
  systemLeitura$Response(params?: SystemLeitura$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<CpuInfo>>> {
    return systemLeitura(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `systemLeitura$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  systemLeitura(params?: SystemLeitura$Params, context?: HttpContext): Observable<Array<CpuInfo>> {
    return this.systemLeitura$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<CpuInfo>>): Array<CpuInfo> => r.body)
    );
  }

}
