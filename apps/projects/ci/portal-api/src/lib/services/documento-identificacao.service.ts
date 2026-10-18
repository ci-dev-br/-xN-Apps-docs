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

import { DocumentoIdentificacao } from '../models/documento-identificacao';
import { GetByInternalIdInputDto } from '../models/get-by-internal-id-input-dto';
import { ObterListaDocumentoIdentificacao } from '../models/obter-lista-documento-identificacao';
import { SyncPayloadDaoDocumentoIdentificacao } from '../models/sync-payload-dao-documento-identificacao';

@Injectable()
export class DocumentoIdentificacaoService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  static readonly SyncDocumentoIdentificacaoPath = '/DocumentoIdentificacao/Sync';
  static readonly GetByInternalIdDocumentoIdentificacaoPath = '/DocumentoIdentificacao/GetByInternalId';
  static readonly GetListDocumentoIdentificacaoPath = '/DocumentoIdentificacao/GetList';
  static readonly DeleteDocumentoIdentificacaoPath = '/DocumentoIdentificacao/Delete';

  sync(params: { body: SyncPayloadDaoDocumentoIdentificacao }, context?: HttpContext): Observable<SyncPayloadDaoDocumentoIdentificacao> {
    const rb = new RequestBuilder(this.rootUrl, DocumentoIdentificacaoService.SyncDocumentoIdentificacaoPath, 'post');
    if (params) rb.body(params.body, 'application/json');
    return this.http.request(rb.build({ responseType: 'json', accept: 'application/json', context })).pipe(
      filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => (r as StrictHttpResponse<SyncPayloadDaoDocumentoIdentificacao>).body)
    );
  }

  getByInternalId(params: { body: GetByInternalIdInputDto }, context?: HttpContext): Observable<DocumentoIdentificacao> {
    const rb = new RequestBuilder(this.rootUrl, DocumentoIdentificacaoService.GetByInternalIdDocumentoIdentificacaoPath, 'post');
    if (params) rb.body(params.body, 'application/json');
    return this.http.request(rb.build({ responseType: 'json', accept: 'application/json', context })).pipe(
      filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => (r as StrictHttpResponse<DocumentoIdentificacao>).body)
    );
  }

  getList(params: { body: ObterListaDocumentoIdentificacao }, context?: HttpContext): Observable<SyncPayloadDaoDocumentoIdentificacao> {
    const rb = new RequestBuilder(this.rootUrl, DocumentoIdentificacaoService.GetListDocumentoIdentificacaoPath, 'post');
    if (params) rb.body(params.body, 'application/json');
    return this.http.request(rb.build({ responseType: 'json', accept: 'application/json', context })).pipe(
      filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => (r as StrictHttpResponse<SyncPayloadDaoDocumentoIdentificacao>).body)
    );
  }

  delete(params: { body: DocumentoIdentificacao }, context?: HttpContext): Observable<DocumentoIdentificacao> {
    const rb = new RequestBuilder(this.rootUrl, DocumentoIdentificacaoService.DeleteDocumentoIdentificacaoPath, 'post');
    if (params) rb.body(params.body, 'application/json');
    return this.http.request(rb.build({ responseType: 'json', accept: 'application/json', context })).pipe(
      filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => (r as StrictHttpResponse<DocumentoIdentificacao>).body)
    );
  }
}
