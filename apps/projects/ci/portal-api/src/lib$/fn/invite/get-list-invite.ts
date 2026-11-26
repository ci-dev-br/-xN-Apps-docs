/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { Invite } from '../../models/invite';

export interface GetListInvite$Params {
}

export function getListInvite(http: HttpClient, rootUrl: string, params?: GetListInvite$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<Invite>>> {
  const rb = new RequestBuilder(rootUrl, getListInvite.PATH, 'post');
  if (params) {
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<Invite>>;
    })
  );
}

getListInvite.PATH = '/Invite/Get';
