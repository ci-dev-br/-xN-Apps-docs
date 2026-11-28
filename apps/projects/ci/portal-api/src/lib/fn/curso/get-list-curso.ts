/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { Curso } from '../../models/curso';
import { ObterListaCurso } from '../../models/obter-lista-curso';

export interface GetListCurso$Params {
      body: ObterListaCurso
}

export function getListCurso(http: HttpClient, rootUrl: string, params: GetListCurso$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<Curso>>> {
  const rb = new RequestBuilder(rootUrl, getListCurso.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<Curso>>;
    })
  );
}

getListCurso.PATH = '/Curso/GetList';
