/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { AnexarMaterialAulaInputDto } from '../../models/anexar-material-aula-input-dto';
import { Aula } from '../../models/aula';

export interface AnexarMaterialAula$Params {
      body: AnexarMaterialAulaInputDto
}

export function anexarMaterialAula(http: HttpClient, rootUrl: string, params: AnexarMaterialAula$Params, context?: HttpContext): Observable<StrictHttpResponse<Aula>> {
  const rb = new RequestBuilder(rootUrl, anexarMaterialAula.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Aula>;
    })
  );
}

anexarMaterialAula.PATH = '/Aula/AnexarMaterial';
