/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { Grupo } from '../models/grupo';
import { GrupoAtivoCompartilhado } from '../models/grupo-ativo-compartilhado';
import { GrupoTopico } from '../models/grupo-topico';
import { GrupoTopicoMensagem } from '../models/grupo-topico-mensagem';
import { tenantCreateGroup } from '../fn/tenant/tenant-create-group';
import { TenantCreateGroup$Params } from '../fn/tenant/tenant-create-group';
import { tenantCreateTopic } from '../fn/tenant/tenant-create-topic';
import { TenantCreateTopic$Params } from '../fn/tenant/tenant-create-topic';
import { tenantGetGroup } from '../fn/tenant/tenant-get-group';
import { TenantGetGroup$Params } from '../fn/tenant/tenant-get-group';
import { tenantJoinGroup } from '../fn/tenant/tenant-join-group';
import { TenantJoinGroup$Params } from '../fn/tenant/tenant-join-group';
import { tenantLeaveGroup } from '../fn/tenant/tenant-leave-group';
import { TenantLeaveGroup$Params } from '../fn/tenant/tenant-leave-group';
import { tenantListGroups } from '../fn/tenant/tenant-list-groups';
import { TenantListGroups$Params } from '../fn/tenant/tenant-list-groups';
import { tenantListRequests } from '../fn/tenant/tenant-list-requests';
import { TenantListRequests$Params } from '../fn/tenant/tenant-list-requests';
import { tenantListSharedAssets } from '../fn/tenant/tenant-list-shared-assets';
import { TenantListSharedAssets$Params } from '../fn/tenant/tenant-list-shared-assets';
import { tenantListTopicMessages } from '../fn/tenant/tenant-list-topic-messages';
import { TenantListTopicMessages$Params } from '../fn/tenant/tenant-list-topic-messages';
import { tenantListTopics } from '../fn/tenant/tenant-list-topics';
import { TenantListTopics$Params } from '../fn/tenant/tenant-list-topics';
import { tenantMyGroups } from '../fn/tenant/tenant-my-groups';
import { TenantMyGroups$Params } from '../fn/tenant/tenant-my-groups';
import { tenantReplyTopic } from '../fn/tenant/tenant-reply-topic';
import { TenantReplyTopic$Params } from '../fn/tenant/tenant-reply-topic';
import { tenantRespondRequest } from '../fn/tenant/tenant-respond-request';
import { TenantRespondRequest$Params } from '../fn/tenant/tenant-respond-request';
import { tenantShareAsset } from '../fn/tenant/tenant-share-asset';
import { TenantShareAsset$Params } from '../fn/tenant/tenant-share-asset';

@Injectable()
export class TenantService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `tenantListGroups()` */
  static readonly TenantListGroupsPath = '/Tenant/Groups';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `tenantListGroups()` instead.
   *
   * This method doesn't expect any request body.
   */
  tenantListGroups$Response(params: TenantListGroups$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return tenantListGroups(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `tenantListGroups$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  tenantListGroups(params: TenantListGroups$Params, context?: HttpContext): Observable<void> {
    return this.tenantListGroups$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `tenantCreateGroup()` */
  static readonly TenantCreateGroupPath = '/Tenant/Groups';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `tenantCreateGroup()` instead.
   *
   * This method doesn't expect any request body.
   */
  tenantCreateGroup$Response(params?: TenantCreateGroup$Params, context?: HttpContext): Observable<StrictHttpResponse<Grupo>> {
    return tenantCreateGroup(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `tenantCreateGroup$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  tenantCreateGroup(params?: TenantCreateGroup$Params, context?: HttpContext): Observable<Grupo> {
    return this.tenantCreateGroup$Response(params, context).pipe(
      map((r: StrictHttpResponse<Grupo>): Grupo => r.body)
    );
  }

  /** Path part for operation `tenantMyGroups()` */
  static readonly TenantMyGroupsPath = '/Tenant/Groups/My';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `tenantMyGroups()` instead.
   *
   * This method doesn't expect any request body.
   */
  tenantMyGroups$Response(params?: TenantMyGroups$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return tenantMyGroups(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `tenantMyGroups$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  tenantMyGroups(params?: TenantMyGroups$Params, context?: HttpContext): Observable<void> {
    return this.tenantMyGroups$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `tenantGetGroup()` */
  static readonly TenantGetGroupPath = '/Tenant/Groups/{id}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `tenantGetGroup()` instead.
   *
   * This method doesn't expect any request body.
   */
  tenantGetGroup$Response(params: TenantGetGroup$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return tenantGetGroup(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `tenantGetGroup$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  tenantGetGroup(params: TenantGetGroup$Params, context?: HttpContext): Observable<void> {
    return this.tenantGetGroup$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `tenantJoinGroup()` */
  static readonly TenantJoinGroupPath = '/Tenant/Groups/{id}/Join';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `tenantJoinGroup()` instead.
   *
   * This method doesn't expect any request body.
   */
  tenantJoinGroup$Response(params: TenantJoinGroup$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return tenantJoinGroup(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `tenantJoinGroup$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  tenantJoinGroup(params: TenantJoinGroup$Params, context?: HttpContext): Observable<void> {
    return this.tenantJoinGroup$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `tenantLeaveGroup()` */
  static readonly TenantLeaveGroupPath = '/Tenant/Groups/{id}/Leave';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `tenantLeaveGroup()` instead.
   *
   * This method doesn't expect any request body.
   */
  tenantLeaveGroup$Response(params: TenantLeaveGroup$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return tenantLeaveGroup(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `tenantLeaveGroup$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  tenantLeaveGroup(params: TenantLeaveGroup$Params, context?: HttpContext): Observable<void> {
    return this.tenantLeaveGroup$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `tenantListRequests()` */
  static readonly TenantListRequestsPath = '/Tenant/Groups/{id}/Requests';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `tenantListRequests()` instead.
   *
   * This method doesn't expect any request body.
   */
  tenantListRequests$Response(params: TenantListRequests$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return tenantListRequests(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `tenantListRequests$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  tenantListRequests(params: TenantListRequests$Params, context?: HttpContext): Observable<void> {
    return this.tenantListRequests$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `tenantRespondRequest()` */
  static readonly TenantRespondRequestPath = '/Tenant/Groups/{id}/Requests/{requestId}/Respond';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `tenantRespondRequest()` instead.
   *
   * This method doesn't expect any request body.
   */
  tenantRespondRequest$Response(params: TenantRespondRequest$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return tenantRespondRequest(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `tenantRespondRequest$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  tenantRespondRequest(params: TenantRespondRequest$Params, context?: HttpContext): Observable<void> {
    return this.tenantRespondRequest$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `tenantListTopics()` */
  static readonly TenantListTopicsPath = '/Tenant/Groups/{id}/Topics';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `tenantListTopics()` instead.
   *
   * This method doesn't expect any request body.
   */
  tenantListTopics$Response(params: TenantListTopics$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<GrupoTopico>>> {
    return tenantListTopics(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `tenantListTopics$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  tenantListTopics(params: TenantListTopics$Params, context?: HttpContext): Observable<Array<GrupoTopico>> {
    return this.tenantListTopics$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<GrupoTopico>>): Array<GrupoTopico> => r.body)
    );
  }

  /** Path part for operation `tenantCreateTopic()` */
  static readonly TenantCreateTopicPath = '/Tenant/Groups/{id}/Topics';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `tenantCreateTopic()` instead.
   *
   * This method doesn't expect any request body.
   */
  tenantCreateTopic$Response(params: TenantCreateTopic$Params, context?: HttpContext): Observable<StrictHttpResponse<GrupoTopico>> {
    return tenantCreateTopic(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `tenantCreateTopic$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  tenantCreateTopic(params: TenantCreateTopic$Params, context?: HttpContext): Observable<GrupoTopico> {
    return this.tenantCreateTopic$Response(params, context).pipe(
      map((r: StrictHttpResponse<GrupoTopico>): GrupoTopico => r.body)
    );
  }

  /** Path part for operation `tenantListTopicMessages()` */
  static readonly TenantListTopicMessagesPath = '/Tenant/Groups/{id}/Topics/{topicId}/Messages';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `tenantListTopicMessages()` instead.
   *
   * This method doesn't expect any request body.
   */
  tenantListTopicMessages$Response(params: TenantListTopicMessages$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<GrupoTopicoMensagem>>> {
    return tenantListTopicMessages(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `tenantListTopicMessages$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  tenantListTopicMessages(params: TenantListTopicMessages$Params, context?: HttpContext): Observable<Array<GrupoTopicoMensagem>> {
    return this.tenantListTopicMessages$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<GrupoTopicoMensagem>>): Array<GrupoTopicoMensagem> => r.body)
    );
  }

  /** Path part for operation `tenantReplyTopic()` */
  static readonly TenantReplyTopicPath = '/Tenant/Groups/{id}/Topics/{topicId}/Messages';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `tenantReplyTopic()` instead.
   *
   * This method doesn't expect any request body.
   */
  tenantReplyTopic$Response(params: TenantReplyTopic$Params, context?: HttpContext): Observable<StrictHttpResponse<GrupoTopicoMensagem>> {
    return tenantReplyTopic(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `tenantReplyTopic$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  tenantReplyTopic(params: TenantReplyTopic$Params, context?: HttpContext): Observable<GrupoTopicoMensagem> {
    return this.tenantReplyTopic$Response(params, context).pipe(
      map((r: StrictHttpResponse<GrupoTopicoMensagem>): GrupoTopicoMensagem => r.body)
    );
  }

  /** Path part for operation `tenantListSharedAssets()` */
  static readonly TenantListSharedAssetsPath = '/Tenant/Groups/{id}/SharedAssets';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `tenantListSharedAssets()` instead.
   *
   * This method doesn't expect any request body.
   */
  tenantListSharedAssets$Response(params: TenantListSharedAssets$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<GrupoAtivoCompartilhado>>> {
    return tenantListSharedAssets(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `tenantListSharedAssets$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  tenantListSharedAssets(params: TenantListSharedAssets$Params, context?: HttpContext): Observable<Array<GrupoAtivoCompartilhado>> {
    return this.tenantListSharedAssets$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<GrupoAtivoCompartilhado>>): Array<GrupoAtivoCompartilhado> => r.body)
    );
  }

  /** Path part for operation `tenantShareAsset()` */
  static readonly TenantShareAssetPath = '/Tenant/Groups/{id}/SharedAssets';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `tenantShareAsset()` instead.
   *
   * This method doesn't expect any request body.
   */
  tenantShareAsset$Response(params: TenantShareAsset$Params, context?: HttpContext): Observable<StrictHttpResponse<GrupoAtivoCompartilhado>> {
    return tenantShareAsset(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `tenantShareAsset$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  tenantShareAsset(params: TenantShareAsset$Params, context?: HttpContext): Observable<GrupoAtivoCompartilhado> {
    return this.tenantShareAsset$Response(params, context).pipe(
      map((r: StrictHttpResponse<GrupoAtivoCompartilhado>): GrupoAtivoCompartilhado => r.body)
    );
  }

}
