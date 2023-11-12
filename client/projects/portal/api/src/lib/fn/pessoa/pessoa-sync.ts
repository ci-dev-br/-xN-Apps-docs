/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SyncPayloadDao } from '../../models/sync-payload-dao';
import { SyncPayloadDaoPessoa } from '../../models/sync-payload-dao-pessoa';

export interface PessoaSync$Params {
      body: SyncPayloadDaoPessoa
}

export function pessoaSync(http: HttpClient, rootUrl: string, params: PessoaSync$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDao>> {
  const rb = new RequestBuilder(rootUrl, pessoaSync.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SyncPayloadDao>;
    })
  );
}

pessoaSync.PATH = '/Pessoa/Sync';
