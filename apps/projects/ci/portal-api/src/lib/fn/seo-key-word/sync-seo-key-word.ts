/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SeoKeyWord } from '../../models/seo-key-word';
import { SyncPayloadDaoSeoKeyWord } from '../../models/sync-payload-dao-seo-key-word';

export interface SyncSeoKeyWord$Params {
      body: SyncPayloadDaoSeoKeyWord
}

export function syncSeoKeyWord(http: HttpClient, rootUrl: string, params: SyncSeoKeyWord$Params, context?: HttpContext): Observable<StrictHttpResponse<SeoKeyWord>> {
  const rb = new RequestBuilder(rootUrl, syncSeoKeyWord.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SeoKeyWord>;
    })
  );
}

syncSeoKeyWord.PATH = '/SeoKeyWord/Sync';
