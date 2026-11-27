/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ObterListaSeoKeyWord } from '../../models/obter-lista-seo-key-word';
import { SeoKeyWord } from '../../models/seo-key-word';

export interface GetListSeoKeyWord$Params {
      body: ObterListaSeoKeyWord
}

export function getListSeoKeyWord(http: HttpClient, rootUrl: string, params: GetListSeoKeyWord$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<SeoKeyWord>>> {
  const rb = new RequestBuilder(rootUrl, getListSeoKeyWord.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<SeoKeyWord>>;
    })
  );
}

getListSeoKeyWord.PATH = '/SeoKeyWord/GetList';
