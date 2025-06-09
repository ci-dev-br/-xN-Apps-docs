/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ObterListaServico } from '../../models/obter-lista-servico';
import { Servico } from '../../models/servico';

export interface GetListServico$Params {
      body: ObterListaServico
}

export function getListServico(http: HttpClient, rootUrl: string, params: GetListServico$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<Servico>>> {
  const rb = new RequestBuilder(rootUrl, getListServico.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<Servico>>;
    })
  );
}

getListServico.PATH = '/Servico/GetList';
