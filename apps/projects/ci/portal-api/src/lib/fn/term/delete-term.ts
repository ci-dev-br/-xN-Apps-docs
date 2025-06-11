/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { Term } from '../../models/term';

export interface DeleteTerm$Params {
      body: Term
}

export function deleteTerm(http: HttpClient, rootUrl: string, params: DeleteTerm$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<Term>>> {
  const rb = new RequestBuilder(rootUrl, deleteTerm.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<Term>>;
    })
  );
}

deleteTerm.PATH = '/Term/Delete';
