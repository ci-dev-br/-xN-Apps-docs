/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { deleteMatricula } from '../fn/matricula/delete-matricula';
import { DeleteMatricula$Params } from '../fn/matricula/delete-matricula';
import { getByInternalIdMatricula } from '../fn/matricula/get-by-internal-id-matricula';
import { GetByInternalIdMatricula$Params } from '../fn/matricula/get-by-internal-id-matricula';
import { getListMatricula } from '../fn/matricula/get-list-matricula';
import { GetListMatricula$Params } from '../fn/matricula/get-list-matricula';
import { Matricula } from '../models/matricula';
import { matricularMatricula } from '../fn/matricula/matricular-matricula';
import { MatricularMatricula$Params } from '../fn/matricula/matricular-matricula';
import { registrarProgressoMatricula } from '../fn/matricula/registrar-progresso-matricula';
import { RegistrarProgressoMatricula$Params } from '../fn/matricula/registrar-progresso-matricula';
import { syncMatricula } from '../fn/matricula/sync-matricula';
import { SyncMatricula$Params } from '../fn/matricula/sync-matricula';

@Injectable()
export class MatriculaService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncMatricula()` */
  static readonly SyncMatriculaPath = '/Matricula/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncMatricula()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncMatricula$Response(params: SyncMatricula$Params, context?: HttpContext): Observable<StrictHttpResponse<Matricula>> {
    return syncMatricula(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncMatricula$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncMatricula$Params, context?: HttpContext): Observable<Matricula> {
    return this.syncMatricula$Response(params, context).pipe(
      map((r: StrictHttpResponse<Matricula>): Matricula => r.body)
    );
  }

  /** Path part for operation `getByInternalIdMatricula()` */
  static readonly GetByInternalIdMatriculaPath = '/Matricula/GetByInternalId';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getByInternalIdMatricula()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalIdMatricula$Response(params: GetByInternalIdMatricula$Params, context?: HttpContext): Observable<StrictHttpResponse<Matricula>> {
    return getByInternalIdMatricula(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getByInternalIdMatricula$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalId(params: GetByInternalIdMatricula$Params, context?: HttpContext): Observable<Matricula> {
    return this.getByInternalIdMatricula$Response(params, context).pipe(
      map((r: StrictHttpResponse<Matricula>): Matricula => r.body)
    );
  }

  /** Path part for operation `getListMatricula()` */
  static readonly GetListMatriculaPath = '/Matricula/GetList';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListMatricula()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListMatricula$Response(params: GetListMatricula$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<Matricula>>> {
    return getListMatricula(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListMatricula$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListMatricula$Params, context?: HttpContext): Observable<Array<Matricula>> {
    return this.getListMatricula$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<Matricula>>): Array<Matricula> => r.body)
    );
  }

  /** Path part for operation `deleteMatricula()` */
  static readonly DeleteMatriculaPath = '/Matricula/Delete';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `deleteMatricula()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  deleteMatricula$Response(params: DeleteMatricula$Params, context?: HttpContext): Observable<StrictHttpResponse<Matricula>> {
    return deleteMatricula(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `deleteMatricula$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  delete(params: DeleteMatricula$Params, context?: HttpContext): Observable<Matricula> {
    return this.deleteMatricula$Response(params, context).pipe(
      map((r: StrictHttpResponse<Matricula>): Matricula => r.body)
    );
  }

  /** Path part for operation `matricularMatricula()` */
  static readonly MatricularMatriculaPath = '/Matricula/Matricular';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `matricularMatricula()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  matricularMatricula$Response(params: MatricularMatricula$Params, context?: HttpContext): Observable<StrictHttpResponse<Matricula>> {
    return matricularMatricula(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `matricularMatricula$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  matricular(params: MatricularMatricula$Params, context?: HttpContext): Observable<Matricula> {
    return this.matricularMatricula$Response(params, context).pipe(
      map((r: StrictHttpResponse<Matricula>): Matricula => r.body)
    );
  }

  /** Path part for operation `registrarProgressoMatricula()` */
  static readonly RegistrarProgressoMatriculaPath = '/Matricula/RegistrarProgresso';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `registrarProgressoMatricula()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  registrarProgressoMatricula$Response(params: RegistrarProgressoMatricula$Params, context?: HttpContext): Observable<StrictHttpResponse<Matricula>> {
    return registrarProgressoMatricula(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `registrarProgressoMatricula$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  registrarProgresso(params: RegistrarProgressoMatricula$Params, context?: HttpContext): Observable<Matricula> {
    return this.registrarProgressoMatricula$Response(params, context).pipe(
      map((r: StrictHttpResponse<Matricula>): Matricula => r.body)
    );
  }

}
