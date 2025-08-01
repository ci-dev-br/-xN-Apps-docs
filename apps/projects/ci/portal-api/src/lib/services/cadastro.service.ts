/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { editablesCadastro } from '../fn/cadastro/editables-cadastro';
import { EditablesCadastro$Params } from '../fn/cadastro/editables-cadastro';
import { getAllCadastro } from '../fn/cadastro/get-all-cadastro';
import { GetAllCadastro$Params } from '../fn/cadastro/get-all-cadastro';
import { IDynamicForm } from '../models/i-dynamic-form';

@Injectable()
export class CadastroService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `editablesCadastro()` */
  static readonly EditablesCadastroPath = '/Cadastro/Editables';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `editablesCadastro()` instead.
   *
   * This method doesn't expect any request body.
   */
  editablesCadastro$Response(params?: EditablesCadastro$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<string>>> {
    return editablesCadastro(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `editablesCadastro$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  editables(params?: EditablesCadastro$Params, context?: HttpContext): Observable<Array<string>> {
    return this.editablesCadastro$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<string>>): Array<string> => r.body)
    );
  }

  /** Path part for operation `getAllCadastro()` */
  static readonly GetAllCadastroPath = '/Cadastro/All';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getAllCadastro()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getAllCadastro$Response(params: GetAllCadastro$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<IDynamicForm>>> {
    return getAllCadastro(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getAllCadastro$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getAll(params: GetAllCadastro$Params, context?: HttpContext): Observable<Array<IDynamicForm>> {
    return this.getAllCadastro$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<IDynamicForm>>): Array<IDynamicForm> => r.body)
    );
  }

}
