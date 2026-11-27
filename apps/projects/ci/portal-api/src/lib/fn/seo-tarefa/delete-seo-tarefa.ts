/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SeoTarefa } from '../../models/seo-tarefa';

export interface DeleteSeoTarefa$Params {
      body: SeoTarefa
}

export function deleteSeoTarefa(http: HttpClient, rootUrl: string, params: DeleteSeoTarefa$Params, context?: HttpContext): Observable<StrictHttpResponse<SeoTarefa>> {
  const rb = new RequestBuilder(rootUrl, deleteSeoTarefa.PATH, 'post');
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

deleteSeoTarefa.PATH = '/SeoTarefa/Delete';
