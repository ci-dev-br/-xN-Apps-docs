/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { Matricula } from '../../models/matricula';
import { MatricularCursoInputDto } from '../../models/matricular-curso-input-dto';

export interface MatricularMatricula$Params {
      body: MatricularCursoInputDto
}

export function matricularMatricula(http: HttpClient, rootUrl: string, params: MatricularMatricula$Params, context?: HttpContext): Observable<StrictHttpResponse<Matricula>> {
  const rb = new RequestBuilder(rootUrl, matricularMatricula.PATH, 'post');
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

matricularMatricula.PATH = '/Matricula/Matricular';
