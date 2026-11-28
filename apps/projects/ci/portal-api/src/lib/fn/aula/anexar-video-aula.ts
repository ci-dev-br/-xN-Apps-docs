/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { AnexarVideoAulaInputDto } from '../../models/anexar-video-aula-input-dto';
import { Aula } from '../../models/aula';

export interface AnexarVideoAula$Params {
      body: AnexarVideoAulaInputDto
}

export function anexarVideoAula(http: HttpClient, rootUrl: string, params: AnexarVideoAula$Params, context?: HttpContext): Observable<StrictHttpResponse<Aula>> {
  const rb = new RequestBuilder(rootUrl, anexarVideoAula.PATH, 'post');
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

anexarVideoAula.PATH = '/Aula/AnexarVideo';
