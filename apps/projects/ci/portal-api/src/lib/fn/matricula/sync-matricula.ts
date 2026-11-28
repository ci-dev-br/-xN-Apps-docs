/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { Matricula } from '../../models/matricula';
import { SyncPayloadDaoMatricula } from '../../models/sync-payload-dao-matricula';

export interface SyncMatricula$Params {
      body: SyncPayloadDaoMatricula
}

export function syncMatricula(http: HttpClient, rootUrl: string, params: SyncMatricula$Params, context?: HttpContext): Observable<StrictHttpResponse<Matricula>> {
  const rb = new RequestBuilder(rootUrl, syncMatricula.PATH, 'post');
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

syncMatricula.PATH = '/Matricula/Sync';
