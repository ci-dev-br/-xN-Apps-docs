/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { Icon } from '../../models/icon';

export interface DeleteIcon$Params {
      body: Icon
}

export function deleteIcon(http: HttpClient, rootUrl: string, params: DeleteIcon$Params, context?: HttpContext): Observable<StrictHttpResponse<Icon>> {
  const rb = new RequestBuilder(rootUrl, deleteIcon.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Icon>;
    })
  );
}

deleteIcon.PATH = '/Icon/Delete';
