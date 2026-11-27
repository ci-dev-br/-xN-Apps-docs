/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ReaderNewsDigestDto } from '../../models/reader-news-digest-dto';

export interface GetReaderNewsDigest$Params {
  refresh?: boolean;
}

export function getReaderNewsDigest(http: HttpClient, rootUrl: string, params?: GetReaderNewsDigest$Params, context?: HttpContext): Observable<StrictHttpResponse<ReaderNewsDigestDto>> {
  const rb = new RequestBuilder(rootUrl, getReaderNewsDigest.PATH, 'get');
  if (params) {
    rb.query('refresh', params.refresh, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<ReaderNewsDigestDto>;
    })
  );
}

getReaderNewsDigest.PATH = '/News/ReaderDigest';
