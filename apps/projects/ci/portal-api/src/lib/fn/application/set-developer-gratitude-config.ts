/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { DeveloperGratitudeConfigDto } from '../../models/developer-gratitude-config-dto';

export interface SetDeveloperGratitudeConfig$Params {
      body: DeveloperGratitudeConfigDto
}

export function setDeveloperGratitudeConfig(http: HttpClient, rootUrl: string, params: SetDeveloperGratitudeConfig$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
  const rb = new RequestBuilder(rootUrl, setDeveloperGratitudeConfig.PATH, 'post');
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

setDeveloperGratitudeConfig.PATH = '/Application/Gratitude/Configure';
