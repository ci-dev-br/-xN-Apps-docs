/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ObterListaSeoDomain } from '../../models/obter-lista-seo-domain';
import { SeoDomain } from '../../models/seo-domain';

export interface GetListSeoDomain$Params {
      body: ObterListaSeoDomain
}

export function getListSeoDomain(http: HttpClient, rootUrl: string, params: GetListSeoDomain$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<SeoDomain>>> {
  const rb = new RequestBuilder(rootUrl, getListSeoDomain.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<SeoDomain>>;
    })
  );
}

getListSeoDomain.PATH = '/SeoDomain/GetList';
