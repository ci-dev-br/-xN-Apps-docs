/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { Register } from '../../models/register';
import { RegistrarInputDto } from '../../models/registrar-input-dto';

export interface RequestRegisterByFistContact$Params {
      body: RegistrarInputDto
}

export function requestRegisterByFistContact(http: HttpClient, rootUrl: string, params: RequestRegisterByFistContact$Params, context?: HttpContext): Observable<StrictHttpResponse<Register>> {
  const rb = new RequestBuilder(rootUrl, requestRegisterByFistContact.PATH, 'post');
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

requestRegisterByFistContact.PATH = '/Register/RequestRegisterByFistContact';
