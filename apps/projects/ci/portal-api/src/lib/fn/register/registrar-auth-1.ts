/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { Register } from '../../models/register';
import { RegistrarInputDto } from '../../models/registrar-input-dto';

export interface RegistrarAuth_1$Params {
      body: RegistrarInputDto
}

export function registrarAuth_1(http: HttpClient, rootUrl: string, params: RegistrarAuth_1$Params, context?: HttpContext): Observable<StrictHttpResponse<Register>> {
  const rb = new RequestBuilder(rootUrl, registrarAuth_1.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Register>;
    })
  );
}

registrarAuth_1.PATH = '/Register/requestRegisterByFistContact';
