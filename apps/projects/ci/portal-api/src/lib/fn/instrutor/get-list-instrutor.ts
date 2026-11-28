/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { Instrutor } from '../../models/instrutor';
import { ObterListaInstrutor } from '../../models/obter-lista-instrutor';

export interface GetListInstrutor$Params {
      body: ObterListaInstrutor
}

export function getListInstrutor(http: HttpClient, rootUrl: string, params: GetListInstrutor$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<Instrutor>>> {
  const rb = new RequestBuilder(rootUrl, getListInstrutor.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<Instrutor>>;
    })
  );
}

getListInstrutor.PATH = '/Instrutor/GetList';
