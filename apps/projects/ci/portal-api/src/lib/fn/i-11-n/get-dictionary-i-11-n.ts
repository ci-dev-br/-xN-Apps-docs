/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { Dictionary } from '../../models/dictionary';
import { I11NInput } from '../../models/i-11-n-input';

export interface GetDictionaryI11N$Params {
      body: I11NInput
}

export function getDictionaryI11N(http: HttpClient, rootUrl: string, params: GetDictionaryI11N$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<Dictionary>>> {
  const rb = new RequestBuilder(rootUrl, getDictionaryI11N.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<Dictionary>>;
    })
  );
}

getDictionaryI11N.PATH = '/I11n/GetDictionary';
