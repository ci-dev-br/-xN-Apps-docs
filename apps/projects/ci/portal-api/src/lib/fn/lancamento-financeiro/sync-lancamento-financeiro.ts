/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SyncPayloadDaoLancamentoFinanceiro } from '../../models/sync-payload-dao-lancamento-financeiro';

export interface SyncLancamentoFinanceiro$Params {
      body: SyncPayloadDaoLancamentoFinanceiro
}

export function syncLancamentoFinanceiro(http: HttpClient, rootUrl: string, params: SyncLancamentoFinanceiro$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDaoLancamentoFinanceiro>> {
  const rb = new RequestBuilder(rootUrl, syncLancamentoFinanceiro.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SyncPayloadDaoLancamentoFinanceiro>;
    })
  );
}

syncLancamentoFinanceiro.PATH = '/LancamentoFinanceiro/Sync';
