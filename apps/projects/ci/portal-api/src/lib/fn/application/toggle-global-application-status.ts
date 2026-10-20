/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ToggleGlobalAppDto } from '../../models/toggle-global-app-dto';

export interface ToggleGlobalApplicationStatus$Params {
      body: ToggleGlobalAppDto
}

export function toggleGlobalApplicationStatus(http: HttpClient, rootUrl: string, params: ToggleGlobalApplicationStatus$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
  const rb = new RequestBuilder(rootUrl, toggleGlobalApplicationStatus.PATH, 'post');
  if (params) {
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

toggleGlobalApplicationStatus.PATH = '/Application/ToggleGlobalStatus';
