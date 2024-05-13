/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ObterListaPessoa } from '../../models/obter-lista-pessoa';
import { SyncPayloadDaoPessoa } from '../../models/sync-payload-dao-pessoa';

export interface PessoaGet$Params {
      body: ObterListaPessoa
}

export function pessoaGet(http: HttpClient, rootUrl: string, params: PessoaGet$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDaoPessoa>> {
  const rb = new RequestBuilder(rootUrl, pessoaGet.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
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

pessoaGet.PATH = '/Pessoa/Get';
