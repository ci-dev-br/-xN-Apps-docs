/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { IconManifestResponseDto } from '../../models/icon-manifest-response-dto';

export interface GetManifestIcons$Params {
}

export function getManifestIcons(http: HttpClient, rootUrl: string, params?: GetManifestIcons$Params, context?: HttpContext): Observable<StrictHttpResponse<IconManifestResponseDto>> {
  const rb = new RequestBuilder(rootUrl, getManifestIcons.PATH, 'post');
  if (params) {
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<IconManifestResponseDto>;
    })
  );
}

getManifestIcons.PATH = '/Icons/Manifest';
