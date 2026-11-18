/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { CreateKeyboardThemeDto } from '../../models/create-keyboard-theme-dto';
import { KeyboardTheme } from '../../models/keyboard-theme';

export interface KeyboardThemesControllerCreate$Params {
      body: CreateKeyboardThemeDto
}

export function keyboardThemesControllerCreate(http: HttpClient, rootUrl: string, params: KeyboardThemesControllerCreate$Params, context?: HttpContext): Observable<StrictHttpResponse<KeyboardTheme>> {
  const rb = new RequestBuilder(rootUrl, keyboardThemesControllerCreate.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
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

keyboardThemesControllerCreate.PATH = '/keyboard-themes/create';
