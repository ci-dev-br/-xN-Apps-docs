/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ObterListaTermMeta } from '../../models/obter-lista-term-meta';
import { TermMeta } from '../../models/term-meta';

export interface GetListTermMeta$Params {
      body: ObterListaTermMeta
}

export function getListTermMeta(http: HttpClient, rootUrl: string, params: GetListTermMeta$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<TermMeta>>> {
  const rb = new RequestBuilder(rootUrl, getListTermMeta.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<TermMeta>>;
    })
  );
}

getListTermMeta.PATH = '/TermMeta/GetList';
