/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { TermMeta } from '../../models/term-meta';

export interface DeleteTermMeta$Params {
      body: TermMeta
}

export function deleteTermMeta(http: HttpClient, rootUrl: string, params: DeleteTermMeta$Params, context?: HttpContext): Observable<StrictHttpResponse<TermMeta>> {
  const rb = new RequestBuilder(rootUrl, deleteTermMeta.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<TermMeta>;
    })
  );
}

deleteTermMeta.PATH = '/TermMeta/Delete';
