/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { Endereco } from '../../models/endereco';

export interface DeleteEndereco$Params {
      body: Endereco
}

export function deleteEndereco(http: HttpClient, rootUrl: string, params: DeleteEndereco$Params, context?: HttpContext): Observable<StrictHttpResponse<Endereco>> {
  const rb = new RequestBuilder(rootUrl, deleteEndereco.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Endereco>;
    })
  );
}

deleteEndereco.PATH = '/Endereco/Delete';
