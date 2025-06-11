/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { getListServico } from '../fn/servico/get-list-servico';
import { GetListServico$Params } from '../fn/servico/get-list-servico';
import { Servico } from '../models/servico';
import { syncServico } from '../fn/servico/sync-servico';
import { SyncServico$Params } from '../fn/servico/sync-servico';

@Injectable()
export class ServicoService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncServico()` */
  static readonly SyncServicoPath = '/Servico/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncServico()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncServico$Response(params: SyncServico$Params, context?: HttpContext): Observable<StrictHttpResponse<Servico>> {
    return syncServico(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncServico$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncServico$Params, context?: HttpContext): Observable<Servico> {
    return this.syncServico$Response(params, context).pipe(
      map((r: StrictHttpResponse<Servico>): Servico => r.body)
    );
  }

  /** Path part for operation `getListServico()` */
  static readonly GetListServicoPath = '/Servico/GetList';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListServico()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListServico$Response(params: GetListServico$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<Servico>>> {
    return getListServico(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListServico$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListServico$Params, context?: HttpContext): Observable<Array<Servico>> {
    return this.getListServico$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<Servico>>): Array<Servico> => r.body)
    );
  }

}
