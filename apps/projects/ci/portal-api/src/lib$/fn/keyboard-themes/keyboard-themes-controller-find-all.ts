/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { KeyboardTheme } from '../../models/keyboard-theme';

export interface KeyboardThemesControllerFindAll$Params {
}

export function keyboardThemesControllerFindAll(http: HttpClient, rootUrl: string, params?: KeyboardThemesControllerFindAll$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<KeyboardTheme>>> {
  const rb = new RequestBuilder(rootUrl, keyboardThemesControllerFindAll.PATH, 'post');
  if (params) {
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<KeyboardTheme>>;
    })
  );
}

keyboardThemesControllerFindAll.PATH = '/keyboard-themes/findAll';
