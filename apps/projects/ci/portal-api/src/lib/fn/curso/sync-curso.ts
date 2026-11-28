/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { Curso } from '../../models/curso';
import { SyncPayloadDaoCurso } from '../../models/sync-payload-dao-curso';

export interface SyncCurso$Params {
      body: SyncPayloadDaoCurso
}

export function syncCurso(http: HttpClient, rootUrl: string, params: SyncCurso$Params, context?: HttpContext): Observable<StrictHttpResponse<Curso>> {
  const rb = new RequestBuilder(rootUrl, syncCurso.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Curso>;
    })
  );
}

syncCurso.PATH = '/Curso/Sync';
