/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ObterListaSeoCampanha } from '../../models/obter-lista-seo-campanha';
import { SeoCampanha } from '../../models/seo-campanha';

export interface GetListSeoCampanha$Params {
      body: ObterListaSeoCampanha
}

export function getListSeoCampanha(http: HttpClient, rootUrl: string, params: GetListSeoCampanha$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<SeoCampanha>>> {
  const rb = new RequestBuilder(rootUrl, getListSeoCampanha.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<SeoCampanha>>;
    })
  );
}

getListSeoCampanha.PATH = '/SeoCampanha/GetList';
