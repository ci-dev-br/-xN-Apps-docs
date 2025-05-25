/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ObterListaUnidadeMedida } from '../../models/obter-lista-unidade-medida';
import { UnidadeMedida } from '../../models/unidade-medida';

export interface UnidadeMedidaGet$Params {
      body: ObterListaUnidadeMedida
}

export function unidadeMedidaGet(http: HttpClient, rootUrl: string, params: UnidadeMedidaGet$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<UnidadeMedida>>> {
  const rb = new RequestBuilder(rootUrl, unidadeMedidaGet.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<UnidadeMedida>>;
    })
  );
}

unidadeMedidaGet.PATH = '/UnidadeMedida/Get';
