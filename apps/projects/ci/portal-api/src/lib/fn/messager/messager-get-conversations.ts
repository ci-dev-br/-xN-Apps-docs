/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ConversationResponseDto } from '../../models/conversation-response-dto';

export interface MessagerGetConversations$Params {
}

export function messagerGetConversations(http: HttpClient, rootUrl: string, params?: MessagerGetConversations$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<ConversationResponseDto>>> {
  const rb = new RequestBuilder(rootUrl, messagerGetConversations.PATH, 'post');
  if (params) {
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<ConversationResponseDto>>;
    })
  );
}

messagerGetConversations.PATH = '/Messager/Conversations/List';
