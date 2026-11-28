/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { Matricula } from '../../models/matricula';
import { RegistrarProgressoInputDto } from '../../models/registrar-progresso-input-dto';

export interface RegistrarProgressoMatricula$Params {
      body: RegistrarProgressoInputDto
}

export function registrarProgressoMatricula(http: HttpClient, rootUrl: string, params: RegistrarProgressoMatricula$Params, context?: HttpContext): Observable<StrictHttpResponse<Matricula>> {
  const rb = new RequestBuilder(rootUrl, registrarProgressoMatricula.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Matricula>;
    })
  );
}

registrarProgressoMatricula.PATH = '/Matricula/RegistrarProgresso';
