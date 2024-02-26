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
import { pessoaSync_1 } from '../fn/pessoa/pessoa-sync-1';
import { PessoaSync_1$Params } from '../fn/pessoa/pessoa-sync-1';
import { PessoaSync$Params } from '../fn/pessoa/pessoa-sync';
import { SyncPayloadDaoPessoa } from '../models/sync-payload-dao-pessoa';

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
  pessoaSync$Response(params: PessoaSync$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDaoPessoa>> {
    return pessoaSync(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `pessoaSync$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  pessoaSync(params: PessoaSync$Params, context?: HttpContext): Observable<SyncPayloadDaoPessoa> {
    return this.pessoaSync$Response(params, context).pipe(
      map((r: StrictHttpResponse<SyncPayloadDaoPessoa>): SyncPayloadDaoPessoa => r.body)
    );
  }

  /** Path part for operation `pessoaSync_1()` */
  static readonly PessoaSync_1Path = '/Pessoa/Get';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `pessoaSync_1()` instead.
   *
   * This method doesn't expect any request body.
   */
  pessoaSync_1$Response(params?: PessoaSync_1$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDaoPessoa>> {
    return pessoaSync_1(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `pessoaSync_1$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  pessoaSync_1(params?: PessoaSync_1$Params, context?: HttpContext): Observable<SyncPayloadDaoPessoa> {
    return this.pessoaSync_1$Response(params, context).pipe(
      map((r: StrictHttpResponse<SyncPayloadDaoPessoa>): SyncPayloadDaoPessoa => r.body)
    );
  }

}
