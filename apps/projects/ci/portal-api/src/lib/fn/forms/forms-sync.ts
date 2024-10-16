/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SyncPayloadDaoForm } from '../../models/sync-payload-dao-form';

export interface FormsSync$Params {
      body: SyncPayloadDaoForm
}

export function formsSync(http: HttpClient, rootUrl: string, params: FormsSync$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDaoForm>> {
  const rb = new RequestBuilder(rootUrl, formsSync.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SyncPayloadDaoForm>;
    })
  );
}

formsSync.PATH = '/Forms/Sync';
