/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ConversationResponseDto } from '../../models/conversation-response-dto';
import { StartConversationDto } from '../../models/start-conversation-dto';

export interface MessagerStartConversation$Params {
      body: StartConversationDto
}

export function messagerStartConversation(http: HttpClient, rootUrl: string, params: MessagerStartConversation$Params, context?: HttpContext): Observable<StrictHttpResponse<ConversationResponseDto>> {
  const rb = new RequestBuilder(rootUrl, messagerStartConversation.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<ConversationResponseDto>;
    })
  );
}

messagerStartConversation.PATH = '/Messager/Conversations';
