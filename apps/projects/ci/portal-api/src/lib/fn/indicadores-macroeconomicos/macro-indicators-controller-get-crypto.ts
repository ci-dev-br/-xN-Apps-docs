/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { MacroIndicator } from '../../models/macro-indicator';

export interface MacroIndicatorsControllerGetCrypto$Params {
}

export function macroIndicatorsControllerGetCrypto(http: HttpClient, rootUrl: string, params?: MacroIndicatorsControllerGetCrypto$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<MacroIndicator>>> {
  const rb = new RequestBuilder(rootUrl, macroIndicatorsControllerGetCrypto.PATH, 'get');
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

macroIndicatorsControllerGetCrypto.PATH = '/api/macro-indicators/crypto';
