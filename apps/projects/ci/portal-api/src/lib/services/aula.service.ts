/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { anexarMaterialAula } from '../fn/aula/anexar-material-aula';
import { AnexarMaterialAula$Params } from '../fn/aula/anexar-material-aula';
import { anexarVideoAula } from '../fn/aula/anexar-video-aula';
import { AnexarVideoAula$Params } from '../fn/aula/anexar-video-aula';
import { Aula } from '../models/aula';
import { deleteAula } from '../fn/aula/delete-aula';
import { DeleteAula$Params } from '../fn/aula/delete-aula';
import { getByInternalIdAula } from '../fn/aula/get-by-internal-id-aula';
import { GetByInternalIdAula$Params } from '../fn/aula/get-by-internal-id-aula';
import { getListAula } from '../fn/aula/get-list-aula';
import { GetListAula$Params } from '../fn/aula/get-list-aula';
import { removerMaterialAula } from '../fn/aula/remover-material-aula';
import { RemoverMaterialAula$Params } from '../fn/aula/remover-material-aula';
import { syncAula } from '../fn/aula/sync-aula';
import { SyncAula$Params } from '../fn/aula/sync-aula';

@Injectable()
export class AulaService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncAula()` */
  static readonly SyncAulaPath = '/Aula/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncAula()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncAula$Response(params: SyncAula$Params, context?: HttpContext): Observable<StrictHttpResponse<Aula>> {
    return syncAula(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncAula$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncAula$Params, context?: HttpContext): Observable<Aula> {
    return this.syncAula$Response(params, context).pipe(
      map((r: StrictHttpResponse<Aula>): Aula => r.body)
    );
  }

  /** Path part for operation `getByInternalIdAula()` */
  static readonly GetByInternalIdAulaPath = '/Aula/GetByInternalId';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getByInternalIdAula()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalIdAula$Response(params: GetByInternalIdAula$Params, context?: HttpContext): Observable<StrictHttpResponse<Aula>> {
    return getByInternalIdAula(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getByInternalIdAula$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalId(params: GetByInternalIdAula$Params, context?: HttpContext): Observable<Aula> {
    return this.getByInternalIdAula$Response(params, context).pipe(
      map((r: StrictHttpResponse<Aula>): Aula => r.body)
    );
  }

  /** Path part for operation `getListAula()` */
  static readonly GetListAulaPath = '/Aula/GetList';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListAula()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListAula$Response(params: GetListAula$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<Aula>>> {
    return getListAula(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListAula$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListAula$Params, context?: HttpContext): Observable<Array<Aula>> {
    return this.getListAula$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<Aula>>): Array<Aula> => r.body)
    );
  }

  /** Path part for operation `deleteAula()` */
  static readonly DeleteAulaPath = '/Aula/Delete';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `deleteAula()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  deleteAula$Response(params: DeleteAula$Params, context?: HttpContext): Observable<StrictHttpResponse<Aula>> {
    return deleteAula(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `deleteAula$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  delete(params: DeleteAula$Params, context?: HttpContext): Observable<Aula> {
    return this.deleteAula$Response(params, context).pipe(
      map((r: StrictHttpResponse<Aula>): Aula => r.body)
    );
  }

  /** Path part for operation `anexarVideoAula()` */
  static readonly AnexarVideoAulaPath = '/Aula/AnexarVideo';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `anexarVideoAula()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  anexarVideoAula$Response(params: AnexarVideoAula$Params, context?: HttpContext): Observable<StrictHttpResponse<Aula>> {
    return anexarVideoAula(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `anexarVideoAula$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  anexarVideo(params: AnexarVideoAula$Params, context?: HttpContext): Observable<Aula> {
    return this.anexarVideoAula$Response(params, context).pipe(
      map((r: StrictHttpResponse<Aula>): Aula => r.body)
    );
  }

  /** Path part for operation `anexarMaterialAula()` */
  static readonly AnexarMaterialAulaPath = '/Aula/AnexarMaterial';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `anexarMaterialAula()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  anexarMaterialAula$Response(params: AnexarMaterialAula$Params, context?: HttpContext): Observable<StrictHttpResponse<Aula>> {
    return anexarMaterialAula(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `anexarMaterialAula$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  anexarMaterial(params: AnexarMaterialAula$Params, context?: HttpContext): Observable<Aula> {
    return this.anexarMaterialAula$Response(params, context).pipe(
      map((r: StrictHttpResponse<Aula>): Aula => r.body)
    );
  }

  /** Path part for operation `removerMaterialAula()` */
  static readonly RemoverMaterialAulaPath = '/Aula/RemoverMaterial';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `removerMaterialAula()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  removerMaterialAula$Response(params: RemoverMaterialAula$Params, context?: HttpContext): Observable<StrictHttpResponse<Aula>> {
    return removerMaterialAula(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `removerMaterialAula$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  removerMaterial(params: RemoverMaterialAula$Params, context?: HttpContext): Observable<Aula> {
    return this.removerMaterialAula$Response(params, context).pipe(
      map((r: StrictHttpResponse<Aula>): Aula => r.body)
    );
  }

}
