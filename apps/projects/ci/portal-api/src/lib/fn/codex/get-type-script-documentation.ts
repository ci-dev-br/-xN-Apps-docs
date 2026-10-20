/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { TypeScriptDocumentationInputDto } from '../../models/type-script-documentation-input-dto';
import { TypeScriptDocumentationOutputDto } from '../../models/type-script-documentation-output-dto';

export interface GetTypeScriptDocumentation$Params {
      body: TypeScriptDocumentationInputDto
}

export function getTypeScriptDocumentation(http: HttpClient, rootUrl: string, params: GetTypeScriptDocumentation$Params, context?: HttpContext): Observable<StrictHttpResponse<TypeScriptDocumentationOutputDto>> {
  const rb = new RequestBuilder(rootUrl, getTypeScriptDocumentation.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<TypeScriptDocumentationOutputDto>;
    })
  );
}

getTypeScriptDocumentation.PATH = '/Codex/typescript/documentation';
