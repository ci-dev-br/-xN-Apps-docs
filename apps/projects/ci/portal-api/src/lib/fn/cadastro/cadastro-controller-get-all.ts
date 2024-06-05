/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { IDynamicForm } from '../../models/i-dynamic-form';
import { Payload } from '../../models/payload';

export interface CadastroControllerGetAll$Params {
      body: Payload
}

export function cadastroControllerGetAll(http: HttpClient, rootUrl: string, params: CadastroControllerGetAll$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<IDynamicForm>>> {
  const rb = new RequestBuilder(rootUrl, cadastroControllerGetAll.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<IDynamicForm>>;
    })
  );
}

cadastroControllerGetAll.PATH = '/Cadastro/All';
