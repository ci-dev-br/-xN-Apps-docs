/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { Photo } from '../../models/photo';

export interface SyncPhoto$Params {
      body: Photo
}

export function syncPhoto(http: HttpClient, rootUrl: string, params: SyncPhoto$Params, context?: HttpContext): Observable<StrictHttpResponse<Photo>> {
  const rb = new RequestBuilder(rootUrl, syncPhoto.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Photo>;
    })
  );
}

syncPhoto.PATH = '/Photo/Sync';
