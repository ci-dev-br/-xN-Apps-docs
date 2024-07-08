/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ReadDirectoryInput } from '../../models/read-directory-input';
import { ReadDirectoryOutput } from '../../models/read-directory-output';

export interface FileExplorerControllerReadDirectory$Params {
      body: ReadDirectoryInput
}

export function fileExplorerControllerReadDirectory(http: HttpClient, rootUrl: string, params: FileExplorerControllerReadDirectory$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<ReadDirectoryOutput>>> {
  const rb = new RequestBuilder(rootUrl, fileExplorerControllerReadDirectory.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<ReadDirectoryOutput>>;
    })
  );
}

fileExplorerControllerReadDirectory.PATH = '/FileExplorer/ReadDirectory';
