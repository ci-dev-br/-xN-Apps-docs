/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { Matricula } from '../../models/matricula';
import { ObterListaMatricula } from '../../models/obter-lista-matricula';

export interface GetListMatricula$Params {
      body: ObterListaMatricula
}

export function getListMatricula(http: HttpClient, rootUrl: string, params: GetListMatricula$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<Matricula>>> {
  const rb = new RequestBuilder(rootUrl, getListMatricula.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<Matricula>>;
    })
  );
}

getListMatricula.PATH = '/Matricula/GetList';
