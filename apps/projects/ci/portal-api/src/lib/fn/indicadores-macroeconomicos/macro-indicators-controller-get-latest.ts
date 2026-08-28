/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { MacroIndicator } from '../../models/macro-indicator';

export interface MacroIndicatorsControllerGetLatest$Params {
}

export function macroIndicatorsControllerGetLatest(http: HttpClient, rootUrl: string, params?: MacroIndicatorsControllerGetLatest$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<MacroIndicator>>> {
  const rb = new RequestBuilder(rootUrl, macroIndicatorsControllerGetLatest.PATH, 'post');
  if (params) {
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<MacroIndicator>>;
    })
  );
}

macroIndicatorsControllerGetLatest.PATH = '/api/macro-indicators/latest';
