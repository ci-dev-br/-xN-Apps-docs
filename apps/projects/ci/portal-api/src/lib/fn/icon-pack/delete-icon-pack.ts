/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { IconPack } from '../../models/icon-pack';

export interface DeleteIconPack$Params {
      body: IconPack
}

export function deleteIconPack(http: HttpClient, rootUrl: string, params: DeleteIconPack$Params, context?: HttpContext): Observable<StrictHttpResponse<IconPack>> {
  const rb = new RequestBuilder(rootUrl, deleteIconPack.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<IconPack>;
    })
  );
}

deleteIconPack.PATH = '/IconPack/Delete';
