/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SyncPayloadDaoUnidadeMedida } from '../../models/sync-payload-dao-unidade-medida';
import { UnidadeMedida } from '../../models/unidade-medida';

export interface SyncUnidadeMedida$Params {
      body: SyncPayloadDaoUnidadeMedida
}

export function syncUnidadeMedida(http: HttpClient, rootUrl: string, params: SyncUnidadeMedida$Params, context?: HttpContext): Observable<StrictHttpResponse<UnidadeMedida>> {
  const rb = new RequestBuilder(rootUrl, syncUnidadeMedida.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<UnidadeMedida>;
    })
  );
}

syncUnidadeMedida.PATH = '/UnidadeMedida/Sync';
