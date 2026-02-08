/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { FileDto } from '../../models/file-dto';

export interface ReadFile$Params {
      body: FileDto
}

export function readFile(http: HttpClient, rootUrl: string, params: ReadFile$Params, context?: HttpContext): Observable<StrictHttpResponse<FileDto>> {
  const rb = new RequestBuilder(rootUrl, readFile.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<FileDto>;
    })
  );
}

readFile.PATH = '/FileExplorer/File';
