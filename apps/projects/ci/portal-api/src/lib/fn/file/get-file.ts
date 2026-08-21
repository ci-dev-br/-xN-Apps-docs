/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { File } from '../../models/file';
import { FileGetPaylodInputDto } from '../../models/file-get-paylod-input-dto';

export interface GetFile$Params {
      body: FileGetPaylodInputDto
}

export function getFile(http: HttpClient, rootUrl: string, params: GetFile$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<File>>> {
  const rb = new RequestBuilder(rootUrl, getFile.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<File>>;
    })
  );
}

getFile.PATH = '/File/Get';
