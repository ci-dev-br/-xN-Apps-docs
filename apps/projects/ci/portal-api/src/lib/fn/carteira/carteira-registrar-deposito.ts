/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { DepositoIdentificadoDto } from '../../models/deposito-identificado-dto';

export interface CarteiraRegistrarDeposito$Params {
      body: DepositoIdentificadoDto
}

export function carteiraRegistrarDeposito(http: HttpClient, rootUrl: string, params: CarteiraRegistrarDeposito$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
  const rb = new RequestBuilder(rootUrl, carteiraRegistrarDeposito.PATH, 'post');
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

carteiraRegistrarDeposito.PATH = '/Financeiro/Carteira/Deposito';
