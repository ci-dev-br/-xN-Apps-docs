/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { PagarFaturaComCarteiraDto } from '../../models/pagar-fatura-com-carteira-dto';

export interface CarteiraPagarFatura$Params {
      body: PagarFaturaComCarteiraDto
}

export function carteiraPagarFatura(http: HttpClient, rootUrl: string, params: CarteiraPagarFatura$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
  const rb = new RequestBuilder(rootUrl, carteiraPagarFatura.PATH, 'post');
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

carteiraPagarFatura.PATH = '/Financeiro/Carteira/PagarFatura';
