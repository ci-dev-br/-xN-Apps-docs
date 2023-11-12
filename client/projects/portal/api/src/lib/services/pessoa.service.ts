/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { pessoaSync } from '../fn/pessoa/pessoa-sync';
import { PessoaSync$Params } from '../fn/pessoa/pessoa-sync';
import { SyncPayloadDao } from '../models/sync-payload-dao';

@Injectable({ providedIn: 'root' })
export class PessoaService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `pessoaSync()` */
  static readonly PessoaSyncPath = '/Pessoa/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `pessoaSync()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  pessoaSync$Response(params: PessoaSync$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDao>> {
    return pessoaSync(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `pessoaSync$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  pessoaSync(params: PessoaSync$Params, context?: HttpContext): Observable<SyncPayloadDao> {
    return this.pessoaSync$Response(params, context).pipe(
      map((r: StrictHttpResponse<SyncPayloadDao>): SyncPayloadDao => r.body)
    );
  }

}
