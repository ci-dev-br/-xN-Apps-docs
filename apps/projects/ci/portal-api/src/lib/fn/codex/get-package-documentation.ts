/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { TypeScriptPackageDocInputDto } from '../../models/type-script-package-doc-input-dto';
import { TypeScriptPackageDocOutputDto } from '../../models/type-script-package-doc-output-dto';

export interface GetPackageDocumentation$Params {
      body: TypeScriptPackageDocInputDto
}

export function getPackageDocumentation(http: HttpClient, rootUrl: string, params: GetPackageDocumentation$Params, context?: HttpContext): Observable<StrictHttpResponse<TypeScriptPackageDocOutputDto>> {
  const rb = new RequestBuilder(rootUrl, getPackageDocumentation.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<TypeScriptPackageDocOutputDto>;
    })
  );
}

getPackageDocumentation.PATH = '/Codex/typescript/package-doc';
