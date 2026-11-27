/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { LocateSourceFileOutputDto } from '../../models/locate-source-file-output-dto';

export interface LocateCodexSourceFilesGet$Params {
  name: string;

/**
 * Lista separada por vírgula (ex: .ts,.html)
 */
  extensions?: string;
  directory?: string;
  limit?: number;
}

export function locateCodexSourceFilesGet(http: HttpClient, rootUrl: string, params: LocateCodexSourceFilesGet$Params, context?: HttpContext): Observable<StrictHttpResponse<LocateSourceFileOutputDto>> {
  const rb = new RequestBuilder(rootUrl, locateCodexSourceFilesGet.PATH, 'get');
  if (params) {
    rb.query('name', params.name, {});
    rb.query('extensions', params.extensions, {});
    rb.query('directory', params.directory, {});
    rb.query('limit', params.limit, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<LocateSourceFileOutputDto>;
    })
  );
}

locateCodexSourceFilesGet.PATH = '/Codex/Files/Locate';
