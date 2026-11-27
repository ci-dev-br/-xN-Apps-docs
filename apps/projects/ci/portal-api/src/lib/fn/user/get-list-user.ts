/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { GetListUserDto } from '../../models/get-list-user-dto';
import { User } from '../../models/user';

export interface GetListUser$Params {
      body?: GetListUserDto
}

export function getListUser(http: HttpClient, rootUrl: string, params?: GetListUser$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<User>>> {
  const rb = new RequestBuilder(rootUrl, getListUser.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<User>>;
    })
  );
}

getListUser.PATH = '/User/GetList';
