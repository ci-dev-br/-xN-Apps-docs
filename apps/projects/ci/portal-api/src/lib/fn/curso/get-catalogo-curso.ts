/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { GetCatalogoCursoInputDto } from '../../models/get-catalogo-curso-input-dto';
import { GetCatalogoCursoOutputDto } from '../../models/get-catalogo-curso-output-dto';

export interface GetCatalogoCurso$Params {
      body: GetCatalogoCursoInputDto
}

export function getCatalogoCurso(http: HttpClient, rootUrl: string, params: GetCatalogoCurso$Params, context?: HttpContext): Observable<StrictHttpResponse<GetCatalogoCursoOutputDto>> {
  const rb = new RequestBuilder(rootUrl, getCatalogoCurso.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<GetCatalogoCursoOutputDto>;
    })
  );
}

getCatalogoCurso.PATH = '/Curso/GetCatalogo';
