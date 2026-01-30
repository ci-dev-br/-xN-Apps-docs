/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ObterListaCategory } from '../../models/obter-lista-category';
import { SyncPayloadDaoCategory } from '../../models/sync-payload-dao-category';

export interface CetListcategory$Params {
      body: ObterListaCategory
}

export function cetListcategory(http: HttpClient, rootUrl: string, params: CetListcategory$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDaoCategory>> {
  const rb = new RequestBuilder(rootUrl, cetListcategory.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SyncPayloadDaoCategory>;
    })
  );
}

cetListcategory.PATH = '/Category/GetList';
