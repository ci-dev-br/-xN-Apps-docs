/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { Website } from '../../models/website';

export interface DeleteWebsite$Params {
      body: Website
}

export function deleteWebsite(http: HttpClient, rootUrl: string, params: DeleteWebsite$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<Website>>> {
  const rb = new RequestBuilder(rootUrl, deleteWebsite.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<Website>>;
    })
  );
}

deleteWebsite.PATH = '/Website/DeleteWebsite';
