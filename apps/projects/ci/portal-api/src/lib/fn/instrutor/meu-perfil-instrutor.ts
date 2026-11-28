/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { Instrutor } from '../../models/instrutor';

export interface MeuPerfilInstrutor$Params {
}

export function meuPerfilInstrutor(http: HttpClient, rootUrl: string, params?: MeuPerfilInstrutor$Params, context?: HttpContext): Observable<StrictHttpResponse<Instrutor>> {
  const rb = new RequestBuilder(rootUrl, meuPerfilInstrutor.PATH, 'post');
  if (params) {
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Instrutor>;
    })
  );
}

meuPerfilInstrutor.PATH = '/Instrutor/MeuPerfil';
