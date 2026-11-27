/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { MoverTarefaSeoDto } from '../../models/mover-tarefa-seo-dto';
import { SeoTarefa } from '../../models/seo-tarefa';

export interface MoverTarefaSeo$Params {
      body: MoverTarefaSeoDto
}

export function moverTarefaSeo(http: HttpClient, rootUrl: string, params: MoverTarefaSeo$Params, context?: HttpContext): Observable<StrictHttpResponse<SeoTarefa>> {
  const rb = new RequestBuilder(rootUrl, moverTarefaSeo.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SeoTarefa>;
    })
  );
}

moverTarefaSeo.PATH = '/Seo/MoverTarefa';
