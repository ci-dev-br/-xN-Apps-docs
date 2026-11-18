/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { getListLancamentoFinanceiro } from '../fn/lancamento-financeiro/get-list-lancamento-financeiro';
import { GetListLancamentoFinanceiro$Params } from '../fn/lancamento-financeiro/get-list-lancamento-financeiro';
import { LancamentoFinanceiro } from '../models/lancamento-financeiro';
import { syncLancamentoFinanceiro } from '../fn/lancamento-financeiro/sync-lancamento-financeiro';
import { SyncLancamentoFinanceiro$Params } from '../fn/lancamento-financeiro/sync-lancamento-financeiro';

@Injectable()
export class LancamentoFinanceiroService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncLancamentoFinanceiro()` */
  static readonly SyncLancamentoFinanceiroPath = '/LancamentoFinanceiro/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncLancamentoFinanceiro()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncLancamentoFinanceiro$Response(params: SyncLancamentoFinanceiro$Params, context?: HttpContext): Observable<StrictHttpResponse<LancamentoFinanceiro>> {
    return syncLancamentoFinanceiro(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncLancamentoFinanceiro$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncLancamentoFinanceiro$Params, context?: HttpContext): Observable<LancamentoFinanceiro> {
    return this.syncLancamentoFinanceiro$Response(params, context).pipe(
      map((r: StrictHttpResponse<LancamentoFinanceiro>): LancamentoFinanceiro => r.body)
    );
  }

  /** Path part for operation `getListLancamentoFinanceiro()` */
  static readonly GetListLancamentoFinanceiroPath = '/LancamentoFinanceiro/GetList';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListLancamentoFinanceiro()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListLancamentoFinanceiro$Response(params: GetListLancamentoFinanceiro$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<LancamentoFinanceiro>>> {
    return getListLancamentoFinanceiro(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListLancamentoFinanceiro$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListLancamentoFinanceiro$Params, context?: HttpContext): Observable<Array<LancamentoFinanceiro>> {
    return this.getListLancamentoFinanceiro$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<LancamentoFinanceiro>>): Array<LancamentoFinanceiro> => r.body)
    );
  }

}
