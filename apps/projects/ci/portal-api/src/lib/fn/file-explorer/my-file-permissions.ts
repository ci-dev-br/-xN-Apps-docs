/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { MyFilePermissionsOutputDto } from '../../models/my-file-permissions-output-dto';

export interface MyFilePermissions$Params {
}

export function myFilePermissions(http: HttpClient, rootUrl: string, params?: MyFilePermissions$Params, context?: HttpContext): Observable<StrictHttpResponse<MyFilePermissionsOutputDto>> {
  const rb = new RequestBuilder(rootUrl, myFilePermissions.PATH, 'post');
  if (params) {
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<MyFilePermissionsOutputDto>;
    })
  );
}

myFilePermissions.PATH = '/FileExplorer/MyPermissions';
