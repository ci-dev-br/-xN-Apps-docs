/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { InvitationPayload } from '../../models/invitation-payload';
import { Invite } from '../../models/invite';

export interface GetInvite$Params {
  invite?: string;
  convite?: string;
  inviteHash?: string;
      body?: InvitationPayload
}

export function getInvite(http: HttpClient, rootUrl: string, params?: GetInvite$Params, context?: HttpContext): Observable<StrictHttpResponse<Invite>> {
  const rb = new RequestBuilder(rootUrl, getInvite.PATH, 'post');
  if (params) {
    rb.query('invite', params.invite, {});
    rb.query('convite', params.convite, {});
    rb.query('inviteHash', params.inviteHash, {});
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Invite>;
    })
  );
}

getInvite.PATH = '/Invite/GetInvite';
