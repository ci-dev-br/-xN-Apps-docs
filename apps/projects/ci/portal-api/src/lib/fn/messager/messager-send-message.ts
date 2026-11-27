/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { DirectMessageResponseDto } from '../../models/direct-message-response-dto';
import { SendMessageDto } from '../../models/send-message-dto';

export interface MessagerSendMessage$Params {
  id: string;
      body: SendMessageDto
}

export function messagerSendMessage(http: HttpClient, rootUrl: string, params: MessagerSendMessage$Params, context?: HttpContext): Observable<StrictHttpResponse<DirectMessageResponseDto>> {
  const rb = new RequestBuilder(rootUrl, messagerSendMessage.PATH, 'post');
  if (params) {
    rb.path('id', params.id, {});
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<DirectMessageResponseDto>;
    })
  );
}

messagerSendMessage.PATH = '/Messager/Conversations/{id}/Messages';
