/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { CampanhaMarketing } from '../../models/campanha-marketing';
import { GetByInternalIdInputDto } from '../../models/get-by-internal-id-input-dto';

export interface GetByInternalIdCampanhaMarketing$Params {
      body: GetByInternalIdInputDto
}

export function getByInternalIdCampanhaMarketing(http: HttpClient, rootUrl: string, params: GetByInternalIdCampanhaMarketing$Params, context?: HttpContext): Observable<StrictHttpResponse<CampanhaMarketing>> {
  const rb = new RequestBuilder(rootUrl, getByInternalIdCampanhaMarketing.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<CampanhaMarketing>;
    })
  );
}

getByInternalIdCampanhaMarketing.PATH = '/CampanhaMarketing/GetByInternalId';
