/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ObterListaSeoTarefa } from '../../models/obter-lista-seo-tarefa';
import { SeoTarefa } from '../../models/seo-tarefa';

export interface GetListSeoTarefa$Params {
      body: ObterListaSeoTarefa
}

export function getListSeoTarefa(http: HttpClient, rootUrl: string, params: GetListSeoTarefa$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<SeoTarefa>>> {
  const rb = new RequestBuilder(rootUrl, getListSeoTarefa.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<SeoTarefa>>;
    })
  );
}

getListSeoTarefa.PATH = '/SeoTarefa/GetList';
