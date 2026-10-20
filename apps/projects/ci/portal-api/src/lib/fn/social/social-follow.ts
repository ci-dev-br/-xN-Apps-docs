/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { VinculoSocial } from '../../models/vinculo-social';

export interface SocialFollow$Params {
  userId: string;
}

export function socialFollow(http: HttpClient, rootUrl: string, params: SocialFollow$Params, context?: HttpContext): Observable<StrictHttpResponse<VinculoSocial>> {
  const rb = new RequestBuilder(rootUrl, socialFollow.PATH, 'post');
  if (params) {
    rb.path('userId', params.userId, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<VinculoSocial>;
    })
  );
}

socialFollow.PATH = '/Social/Follow/{userId}';
