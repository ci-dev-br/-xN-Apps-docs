/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { AuthorizeFilePermissionInputDto } from '../../models/authorize-file-permission-input-dto';
import { AuthorizeFilePermissionOutputDto } from '../../models/authorize-file-permission-output-dto';

export interface AuthorizeFilePermission$Params {
      body: AuthorizeFilePermissionInputDto
}

export function authorizeFilePermission(http: HttpClient, rootUrl: string, params: AuthorizeFilePermission$Params, context?: HttpContext): Observable<StrictHttpResponse<AuthorizeFilePermissionOutputDto>> {
  const rb = new RequestBuilder(rootUrl, authorizeFilePermission.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<AuthorizeFilePermissionOutputDto>;
    })
  );
}

authorizeFilePermission.PATH = '/FileExplorer/AuthorizePermission';
