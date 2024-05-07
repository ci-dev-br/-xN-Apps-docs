/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SyncPayloadDaoProduct } from '../../models/sync-payload-dao-product';

export interface ProductSync$Params {
      body: SyncPayloadDaoProduct
}

export function productSync(http: HttpClient, rootUrl: string, params: ProductSync$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDaoProduct>> {
  const rb = new RequestBuilder(rootUrl, productSync.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SyncPayloadDaoProduct>;
    })
  );
}

productSync.PATH = '/Product/Sync';
