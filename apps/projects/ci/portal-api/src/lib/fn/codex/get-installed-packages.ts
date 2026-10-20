/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { TypeScriptInstalledPackagesInputDto } from '../../models/type-script-installed-packages-input-dto';
import { TypeScriptInstalledPackagesOutputDto } from '../../models/type-script-installed-packages-output-dto';

export interface GetInstalledPackages$Params {
      body: TypeScriptInstalledPackagesInputDto
}

export function getInstalledPackages(http: HttpClient, rootUrl: string, params: GetInstalledPackages$Params, context?: HttpContext): Observable<StrictHttpResponse<TypeScriptInstalledPackagesOutputDto>> {
  const rb = new RequestBuilder(rootUrl, getInstalledPackages.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<TypeScriptInstalledPackagesOutputDto>;
    })
  );
}

getInstalledPackages.PATH = '/Codex/typescript/installed-packages';
