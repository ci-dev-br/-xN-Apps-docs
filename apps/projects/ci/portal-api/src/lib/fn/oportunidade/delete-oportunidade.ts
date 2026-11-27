/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { Oportunidade } from '../../models/oportunidade';

export interface DeleteOportunidade$Params {
      body: Oportunidade
}

export function deleteOportunidade(http: HttpClient, rootUrl: string, params: DeleteOportunidade$Params, context?: HttpContext): Observable<StrictHttpResponse<Oportunidade>> {
  const rb = new RequestBuilder(rootUrl, deleteOportunidade.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Oportunidade>;
    })
  );
}

deleteOportunidade.PATH = '/Oportunidade/Delete';
