/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { CampanhaMarketing } from '../../models/campanha-marketing';

export interface DeleteCampanhaMarketing$Params {
      body: CampanhaMarketing
}

export function deleteCampanhaMarketing(http: HttpClient, rootUrl: string, params: DeleteCampanhaMarketing$Params, context?: HttpContext): Observable<StrictHttpResponse<CampanhaMarketing>> {
  const rb = new RequestBuilder(rootUrl, deleteCampanhaMarketing.PATH, 'post');
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

deleteCampanhaMarketing.PATH = '/CampanhaMarketing/Delete';
