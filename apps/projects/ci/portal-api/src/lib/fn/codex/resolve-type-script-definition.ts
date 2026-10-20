/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { TypeScriptDefinitionInputDto } from '../../models/type-script-definition-input-dto';
import { TypeScriptDefinitionOutputDto } from '../../models/type-script-definition-output-dto';

export interface ResolveTypeScriptDefinition$Params {
      body: TypeScriptDefinitionInputDto
}

export function resolveTypeScriptDefinition(http: HttpClient, rootUrl: string, params: ResolveTypeScriptDefinition$Params, context?: HttpContext): Observable<StrictHttpResponse<TypeScriptDefinitionOutputDto>> {
  const rb = new RequestBuilder(rootUrl, resolveTypeScriptDefinition.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<TypeScriptDefinitionOutputDto>;
    })
  );
}

resolveTypeScriptDefinition.PATH = '/Codex/typescript/definition';
