/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SeoTarefa } from '../../models/seo-tarefa';
import { SyncPayloadDaoSeoTarefa } from '../../models/sync-payload-dao-seo-tarefa';

export interface SyncSeoTarefa$Params {
      body: SyncPayloadDaoSeoTarefa
}

export function syncSeoTarefa(http: HttpClient, rootUrl: string, params: SyncSeoTarefa$Params, context?: HttpContext): Observable<StrictHttpResponse<SeoTarefa>> {
  const rb = new RequestBuilder(rootUrl, syncSeoTarefa.PATH, 'post');
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

syncSeoTarefa.PATH = '/SeoTarefa/Sync';
