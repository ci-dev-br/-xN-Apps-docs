/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SyncPayloadDaoProduct } from '../../models/sync-payload-dao-product';

export interface ProductGet$Params {
}

export function productGet(http: HttpClient, rootUrl: string, params?: ProductGet$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDaoProduct>> {
  const rb = new RequestBuilder(rootUrl, productGet.PATH, 'post');
  if (params) {
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

productGet.PATH = '/Product/Get';
