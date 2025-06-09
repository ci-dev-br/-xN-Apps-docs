/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ClienteCrm } from '../../models/cliente-crm';
import { ObterListaClienteCrm } from '../../models/obter-lista-cliente-crm';

export interface GetListClienteCrm$Params {
      body: ObterListaClienteCrm
}

export function getListClienteCrm(http: HttpClient, rootUrl: string, params: GetListClienteCrm$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<ClienteCrm>>> {
  const rb = new RequestBuilder(rootUrl, getListClienteCrm.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<ClienteCrm>>;
    })
  );
}

getListClienteCrm.PATH = '/ClienteCrm/GetList';
