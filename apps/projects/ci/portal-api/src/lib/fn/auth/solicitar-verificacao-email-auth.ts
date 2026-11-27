/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SolicitarVerificacaoEmailInputDto } from '../../models/solicitar-verificacao-email-input-dto';
import { SolicitarVerificacaoEmailOutputDto } from '../../models/solicitar-verificacao-email-output-dto';

export interface SolicitarVerificacaoEmailAuth$Params {
      body: SolicitarVerificacaoEmailInputDto
}

export function solicitarVerificacaoEmailAuth(http: HttpClient, rootUrl: string, params: SolicitarVerificacaoEmailAuth$Params, context?: HttpContext): Observable<StrictHttpResponse<SolicitarVerificacaoEmailOutputDto>> {
  const rb = new RequestBuilder(rootUrl, solicitarVerificacaoEmailAuth.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SolicitarVerificacaoEmailOutputDto>;
    })
  );
}

solicitarVerificacaoEmailAuth.PATH = '/auth/SolicitarVerificacaoEmail';
