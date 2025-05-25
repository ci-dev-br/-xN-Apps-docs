/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { Photo } from '../../models/photo';
import { PhotoGetPaylodInputDto } from '../../models/photo-get-paylod-input-dto';

export interface GetPhoto$Params {
      body: PhotoGetPaylodInputDto
}

export function getPhoto(http: HttpClient, rootUrl: string, params: GetPhoto$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<Photo>>> {
  const rb = new RequestBuilder(rootUrl, getPhoto.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<Photo>>;
    })
  );
}

getPhoto.PATH = '/Photo/Get';
