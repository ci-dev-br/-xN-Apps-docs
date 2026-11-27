/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { FilePermissionItemDto } from '../../models/file-permission-item-dto';
import { GetPermissionRequestInputDto } from '../../models/get-permission-request-input-dto';

export interface GetFilePermissionRequest$Params {
      body: GetPermissionRequestInputDto
}

export function getFilePermissionRequest(http: HttpClient, rootUrl: string, params: GetFilePermissionRequest$Params, context?: HttpContext): Observable<StrictHttpResponse<FilePermissionItemDto>> {
  const rb = new RequestBuilder(rootUrl, getFilePermissionRequest.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<FilePermissionItemDto>;
    })
  );
}

getFilePermissionRequest.PATH = '/FileExplorer/GetPermissionRequest';
