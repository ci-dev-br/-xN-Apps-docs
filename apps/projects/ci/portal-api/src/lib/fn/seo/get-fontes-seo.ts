/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { Source } from '../../models/source';

export interface GetFontesSeo$Params {
}

export function getFontesSeo(http: HttpClient, rootUrl: string, params?: GetFontesSeo$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<Source>>> {
  const rb = new RequestBuilder(rootUrl, getFontesSeo.PATH, 'post');
  if (params) {
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<Source>>;
    })
  );
}

getFontesSeo.PATH = '/Seo/GetFontes';
