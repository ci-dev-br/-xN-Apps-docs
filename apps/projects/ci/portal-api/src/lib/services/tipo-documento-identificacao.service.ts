/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';
import { RequestBuilder } from '../request-builder';

import { TipoDocumentoIdentificacao } from '../models/tipo-documento-identificacao';
import { GetByInternalIdInputDto } from '../models/get-by-internal-id-input-dto';
import { ObterListaTipoDocumentoIdentificacao } from '../models/obter-lista-tipo-documento-identificacao';
import { SyncPayloadDaoTipoDocumentoIdentificacao } from '../models/sync-payload-dao-tipo-documento-identificacao';

@Injectable()
export class TipoDocumentoIdentificacaoService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  static readonly SyncTipoDocumentoIdentificacaoPath = '/TipoDocumentoIdentificacao/Sync';
  static readonly GetByInternalIdTipoDocumentoIdentificacaoPath = '/TipoDocumentoIdentificacao/GetByInternalId';
  static readonly GetListTipoDocumentoIdentificacaoPath = '/TipoDocumentoIdentificacao/GetList';
  static readonly DeleteTipoDocumentoIdentificacaoPath = '/TipoDocumentoIdentificacao/Delete';

  sync(params: { body: SyncPayloadDaoTipoDocumentoIdentificacao }, context?: HttpContext): Observable<SyncPayloadDaoTipoDocumentoIdentificacao> {
    const rb = new RequestBuilder(this.rootUrl, TipoDocumentoIdentificacaoService.SyncTipoDocumentoIdentificacaoPath, 'post');
    if (params) rb.body(params.body, 'application/json');
    return this.http.request(rb.build({ responseType: 'json', accept: 'application/json', context })).pipe(
      filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => (r as StrictHttpResponse<SyncPayloadDaoTipoDocumentoIdentificacao>).body)
    );
  }

  getByInternalId(params: { body: GetByInternalIdInputDto }, context?: HttpContext): Observable<TipoDocumentoIdentificacao> {
    const rb = new RequestBuilder(this.rootUrl, TipoDocumentoIdentificacaoService.GetByInternalIdTipoDocumentoIdentificacaoPath, 'post');
    if (params) rb.body(params.body, 'application/json');
    return this.http.request(rb.build({ responseType: 'json', accept: 'application/json', context })).pipe(
      filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => (r as StrictHttpResponse<TipoDocumentoIdentificacao>).body)
    );
  }

  getList(params: { body: ObterListaTipoDocumentoIdentificacao }, context?: HttpContext): Observable<SyncPayloadDaoTipoDocumentoIdentificacao> {
    const rb = new RequestBuilder(this.rootUrl, TipoDocumentoIdentificacaoService.GetListTipoDocumentoIdentificacaoPath, 'post');
    if (params) rb.body(params.body, 'application/json');
    return this.http.request(rb.build({ responseType: 'json', accept: 'application/json', context })).pipe(
      filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => (r as StrictHttpResponse<SyncPayloadDaoTipoDocumentoIdentificacao>).body)
    );
  }

  delete(params: { body: TipoDocumentoIdentificacao }, context?: HttpContext): Observable<TipoDocumentoIdentificacao> {
    const rb = new RequestBuilder(this.rootUrl, TipoDocumentoIdentificacaoService.DeleteTipoDocumentoIdentificacaoPath, 'post');
    if (params) rb.body(params.body, 'application/json');
    return this.http.request(rb.build({ responseType: 'json', accept: 'application/json', context })).pipe(
      filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => (r as StrictHttpResponse<TipoDocumentoIdentificacao>).body)
    );
  }
}
