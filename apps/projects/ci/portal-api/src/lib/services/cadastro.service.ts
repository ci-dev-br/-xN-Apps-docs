/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { cadastroControllerGetAll } from '../fn/cadastro/cadastro-controller-get-all';
import { CadastroControllerGetAll$Params } from '../fn/cadastro/cadastro-controller-get-all';
import { IDynamicForm } from '../models/i-dynamic-form';

@Injectable({ providedIn: 'root' })
export class CadastroService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `cadastroControllerGetAll()` */
  static readonly CadastroControllerGetAllPath = '/Cadastro/All';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `cadastroControllerGetAll()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  cadastroControllerGetAll$Response(params: CadastroControllerGetAll$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<IDynamicForm>>> {
    return cadastroControllerGetAll(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `cadastroControllerGetAll$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  cadastroControllerGetAll(params: CadastroControllerGetAll$Params, context?: HttpContext): Observable<Array<IDynamicForm>> {
    return this.cadastroControllerGetAll$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<IDynamicForm>>): Array<IDynamicForm> => r.body)
    );
  }

}
