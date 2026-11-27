/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { AvailableUserResponseDto } from '../../models/available-user-response-dto';
import { ListUsersDto } from '../../models/list-users-dto';

export interface MessagerListUsers$Params {
      body: ListUsersDto
}

export function messagerListUsers(http: HttpClient, rootUrl: string, params: MessagerListUsers$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<AvailableUserResponseDto>>> {
  const rb = new RequestBuilder(rootUrl, messagerListUsers.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<AvailableUserResponseDto>>;
    })
  );
}

messagerListUsers.PATH = '/Messager/Users';
