/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SyncPayloadDaoPessoa } from '../../models/sync-payload-dao-pessoa';

export interface PessoaSync_1$Params {
}

export function pessoaSync_1(http: HttpClient, rootUrl: string, params?: PessoaSync_1$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDaoPessoa>> {
  const rb = new RequestBuilder(rootUrl, pessoaSync_1.PATH, 'post');
  if (params) {
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SyncPayloadDaoPessoa>;
    })
  );
}

pessoaSync_1.PATH = '/Pessoa/Get';
