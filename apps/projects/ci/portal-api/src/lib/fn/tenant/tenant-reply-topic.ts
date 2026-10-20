/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { GrupoTopicoMensagem } from '../../models/grupo-topico-mensagem';

export interface TenantReplyTopic$Params {
  topicId: string;
}

export function tenantReplyTopic(http: HttpClient, rootUrl: string, params: TenantReplyTopic$Params, context?: HttpContext): Observable<StrictHttpResponse<GrupoTopicoMensagem>> {
  const rb = new RequestBuilder(rootUrl, tenantReplyTopic.PATH, 'post');
  if (params) {
    rb.path('topicId', params.topicId, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<GrupoTopicoMensagem>;
    })
  );
}

tenantReplyTopic.PATH = '/Tenant/Groups/{id}/Topics/{topicId}/Messages';
