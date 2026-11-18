/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { RecordUsageDto } from '../../models/record-usage-dto';

export interface RecordApplicationUsage$Params {
  'x-origin-application': string;
  'x-application-git-hash': string;
      body: RecordUsageDto
}

export function recordApplicationUsage(http: HttpClient, rootUrl: string, params: RecordApplicationUsage$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
  const rb = new RequestBuilder(rootUrl, recordApplicationUsage.PATH, 'post');
  if (params) {
    rb.header('x-origin-application', params['x-origin-application'], {});
    rb.header('x-application-git-hash', params['x-application-git-hash'], {});
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'text', accept: '*/*', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return (r as HttpResponse<any>).clone({ body: undefined }) as StrictHttpResponse<void>;
    })
  );
}

recordApplicationUsage.PATH = '/Application/RecordUsage';
