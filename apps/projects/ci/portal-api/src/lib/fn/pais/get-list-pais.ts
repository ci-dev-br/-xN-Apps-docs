/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ObterListaPais } from '../../models/obter-lista-pais';
import { Pais } from '../../models/pais';

export interface GetListPais$Params {
      body: ObterListaPais
}

export function getListPais(http: HttpClient, rootUrl: string, params: GetListPais$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<Pais>>> {
  const rb = new RequestBuilder(rootUrl, getListPais.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<Pais>>;
    })
  );
}

getListPais.PATH = '/Pais/GetList';
