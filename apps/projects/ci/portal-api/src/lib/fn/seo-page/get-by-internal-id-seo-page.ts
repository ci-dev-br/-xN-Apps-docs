/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { GetByInternalIdInputDto } from '../../models/get-by-internal-id-input-dto';
import { SeoPage } from '../../models/seo-page';

export interface GetByInternalIdSeoPage$Params {
      body: GetByInternalIdInputDto
}

export function getByInternalIdSeoPage(http: HttpClient, rootUrl: string, params: GetByInternalIdSeoPage$Params, context?: HttpContext): Observable<StrictHttpResponse<SeoPage>> {
  const rb = new RequestBuilder(rootUrl, getByInternalIdSeoPage.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SeoPage>;
    })
  );
}

getByInternalIdSeoPage.PATH = '/SeoPage/GetByInternalId';
