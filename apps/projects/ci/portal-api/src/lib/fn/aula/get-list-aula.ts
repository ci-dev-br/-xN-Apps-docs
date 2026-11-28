/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { Aula } from '../../models/aula';
import { ObterListaAula } from '../../models/obter-lista-aula';

export interface GetListAula$Params {
      body: ObterListaAula
}

export function getListAula(http: HttpClient, rootUrl: string, params: GetListAula$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<Aula>>> {
  const rb = new RequestBuilder(rootUrl, getListAula.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<Aula>>;
    })
  );
}

getListAula.PATH = '/Aula/GetList';
