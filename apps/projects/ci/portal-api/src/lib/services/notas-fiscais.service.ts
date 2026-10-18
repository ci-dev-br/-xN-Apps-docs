/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { notaFiscalControllerEmitir } from '../fn/notas-fiscais/nota-fiscal-controller-emitir';
import { NotaFiscalControllerEmitir$Params } from '../fn/notas-fiscais/nota-fiscal-controller-emitir';

@Injectable()
export class NotasFiscaisService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `notaFiscalControllerEmitir()` */
  static readonly NotaFiscalControllerEmitirPath = '/notas-fiscais/emitir';

  /**
   * Emite uma nova Nota Fiscal para SEFAZ/Curitiba.
   *
   *
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `notaFiscalControllerEmitir()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  notaFiscalControllerEmitir$Response(params: NotaFiscalControllerEmitir$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return notaFiscalControllerEmitir(this.http, this.rootUrl, params, context);
  }

  /**
   * Emite uma nova Nota Fiscal para SEFAZ/Curitiba.
   *
   *
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `notaFiscalControllerEmitir$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  notaFiscalControllerEmitir(params: NotaFiscalControllerEmitir$Params, context?: HttpContext): Observable<void> {
    return this.notaFiscalControllerEmitir$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

}
