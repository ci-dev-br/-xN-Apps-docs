/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { Block } from '../../models/block';

export interface DeleteBlock$Params {
      body: Block
}

export function deleteBlock(http: HttpClient, rootUrl: string, params: DeleteBlock$Params, context?: HttpContext): Observable<StrictHttpResponse<Block>> {
  const rb = new RequestBuilder(rootUrl, deleteBlock.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Block>;
    })
  );
}

deleteBlock.PATH = '/Block/Delete';
