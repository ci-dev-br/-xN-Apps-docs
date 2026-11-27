/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { GetByInternalIdInputDto } from '../../models/get-by-internal-id-input-dto';
import { Produto } from '../../models/produto';

export interface GetByInternalIdProduto$Params {
      body: GetByInternalIdInputDto
}

export function getByInternalIdProduto(http: HttpClient, rootUrl: string, params: GetByInternalIdProduto$Params, context?: HttpContext): Observable<StrictHttpResponse<Produto>> {
  const rb = new RequestBuilder(rootUrl, getByInternalIdProduto.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Produto>;
    })
  );
}

getByInternalIdProduto.PATH = '/Produto/GetByInternalId';
