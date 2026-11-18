/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { Conversation } from '../../models/conversation';

export interface SyncConversation$Params {
}

export function syncConversation(http: HttpClient, rootUrl: string, params?: SyncConversation$Params, context?: HttpContext): Observable<StrictHttpResponse<Conversation>> {
  const rb = new RequestBuilder(rootUrl, syncConversation.PATH, 'post');
  if (params) {
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Conversation>;
    })
  );
}

syncConversation.PATH = '/Conversation/SyncConversation';
