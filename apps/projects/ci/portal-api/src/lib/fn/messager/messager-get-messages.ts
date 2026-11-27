/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { DirectMessageResponseDto } from '../../models/direct-message-response-dto';

export interface MessagerGetMessages$Params {
  id: string;
}

export function messagerGetMessages(http: HttpClient, rootUrl: string, params: MessagerGetMessages$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<DirectMessageResponseDto>>> {
  const rb = new RequestBuilder(rootUrl, messagerGetMessages.PATH, 'post');
  if (params) {
    rb.path('id', params.id, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<DirectMessageResponseDto>>;
    })
  );
}

messagerGetMessages.PATH = '/Messager/Conversations/{id}/Messages/List';
