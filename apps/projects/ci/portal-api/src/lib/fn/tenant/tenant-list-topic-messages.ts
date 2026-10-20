/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { GrupoTopicoMensagem } from '../../models/grupo-topico-mensagem';

export interface TenantListTopicMessages$Params {
  topicId: string;
}

export function tenantListTopicMessages(http: HttpClient, rootUrl: string, params: TenantListTopicMessages$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<GrupoTopicoMensagem>>> {
  const rb = new RequestBuilder(rootUrl, tenantListTopicMessages.PATH, 'get');
  if (params) {
    rb.path('topicId', params.topicId, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<GrupoTopicoMensagem>>;
    })
  );
}

tenantListTopicMessages.PATH = '/Tenant/Groups/{id}/Topics/{topicId}/Messages';
