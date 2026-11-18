/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { KeyboardTheme } from '../../models/keyboard-theme';

export interface KeyboardThemesControllerFindOne$Params {
  id: string;
}

export function keyboardThemesControllerFindOne(http: HttpClient, rootUrl: string, params: KeyboardThemesControllerFindOne$Params, context?: HttpContext): Observable<StrictHttpResponse<KeyboardTheme>> {
  const rb = new RequestBuilder(rootUrl, keyboardThemesControllerFindOne.PATH, 'post');
  if (params) {
    rb.path('id', params.id, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<KeyboardTheme>;
    })
  );
}

keyboardThemesControllerFindOne.PATH = '/keyboard-themes/{id}';
