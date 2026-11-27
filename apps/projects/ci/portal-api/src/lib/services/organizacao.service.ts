/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { assignOrganizacaoMemberRoles } from '../fn/organizacao/assign-organizacao-member-roles';
import { AssignOrganizacaoMemberRoles$Params } from '../fn/organizacao/assign-organizacao-member-roles';
import { createOrganizacao } from '../fn/organizacao/create-organizacao';
import { CreateOrganizacao$Params } from '../fn/organizacao/create-organizacao';
import { createOrganizacaoRole } from '../fn/organizacao/create-organizacao-role';
import { CreateOrganizacaoRole$Params } from '../fn/organizacao/create-organizacao-role';
import { deleteOrganizacaoRole } from '../fn/organizacao/delete-organizacao-role';
import { DeleteOrganizacaoRole$Params } from '../fn/organizacao/delete-organizacao-role';
import { getByInternalIdOrganizacao } from '../fn/organizacao/get-by-internal-id-organizacao';
import { GetByInternalIdOrganizacao$Params } from '../fn/organizacao/get-by-internal-id-organizacao';
import { getListOrganizacao } from '../fn/organizacao/get-list-organizacao';
import { GetListOrganizacao$Params } from '../fn/organizacao/get-list-organizacao';
import { getOrganizacaoDetails } from '../fn/organizacao/get-organizacao-details';
import { GetOrganizacaoDetails$Params } from '../fn/organizacao/get-organizacao-details';
import { listOrganizacaoMembers } from '../fn/organizacao/list-organizacao-members';
import { ListOrganizacaoMembers$Params } from '../fn/organizacao/list-organizacao-members';
import { listOrganizacaoRoles } from '../fn/organizacao/list-organizacao-roles';
import { ListOrganizacaoRoles$Params } from '../fn/organizacao/list-organizacao-roles';
import { myOrganizacoes } from '../fn/organizacao/my-organizacoes';
import { MyOrganizacoes$Params } from '../fn/organizacao/my-organizacoes';
import { Organizacao } from '../models/organizacao';
import { removeOrganizacaoMember } from '../fn/organizacao/remove-organizacao-member';
import { RemoveOrganizacaoMember$Params } from '../fn/organizacao/remove-organizacao-member';
import { searchOrganizacaoUsers } from '../fn/organizacao/search-organizacao-users';
import { SearchOrganizacaoUsers$Params } from '../fn/organizacao/search-organizacao-users';
import { shareOrganizacaoTenant } from '../fn/organizacao/share-organizacao-tenant';
import { ShareOrganizacaoTenant$Params } from '../fn/organizacao/share-organizacao-tenant';
import { syncOrganizacao } from '../fn/organizacao/sync-organizacao';
import { SyncOrganizacao$Params } from '../fn/organizacao/sync-organizacao';
import { SyncPayloadDaoOrganizacao } from '../models/sync-payload-dao-organizacao';
import { updateOrganizacao } from '../fn/organizacao/update-organizacao';
import { UpdateOrganizacao$Params } from '../fn/organizacao/update-organizacao';

@Injectable()
export class OrganizacaoService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncOrganizacao()` */
  static readonly SyncOrganizacaoPath = '/Organizacao/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncOrganizacao()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncOrganizacao$Response(params: SyncOrganizacao$Params, context?: HttpContext): Observable<StrictHttpResponse<SyncPayloadDaoOrganizacao>> {
    return syncOrganizacao(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncOrganizacao$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncOrganizacao$Params, context?: HttpContext): Observable<SyncPayloadDaoOrganizacao> {
    return this.syncOrganizacao$Response(params, context).pipe(
      map((r: StrictHttpResponse<SyncPayloadDaoOrganizacao>): SyncPayloadDaoOrganizacao => r.body)
    );
  }

  /** Path part for operation `getByInternalIdOrganizacao()` */
  static readonly GetByInternalIdOrganizacaoPath = '/Organizacao/GetByInternalId';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getByInternalIdOrganizacao()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalIdOrganizacao$Response(params: GetByInternalIdOrganizacao$Params, context?: HttpContext): Observable<StrictHttpResponse<Organizacao>> {
    return getByInternalIdOrganizacao(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getByInternalIdOrganizacao$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalId(params: GetByInternalIdOrganizacao$Params, context?: HttpContext): Observable<Organizacao> {
    return this.getByInternalIdOrganizacao$Response(params, context).pipe(
      map((r: StrictHttpResponse<Organizacao>): Organizacao => r.body)
    );
  }

  /** Path part for operation `getListOrganizacao()` */
  static readonly GetListOrganizacaoPath = '/Organizacao/GetList';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListOrganizacao()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListOrganizacao$Response(params: GetListOrganizacao$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<Organizacao>>> {
    return getListOrganizacao(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListOrganizacao$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListOrganizacao$Params, context?: HttpContext): Observable<Array<Organizacao>> {
    return this.getListOrganizacao$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<Organizacao>>): Array<Organizacao> => r.body)
    );
  }

  /** Path part for operation `myOrganizacoes()` */
  static readonly MyOrganizacoesPath = '/Organizacao/My';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `myOrganizacoes()` instead.
   *
   * This method doesn't expect any request body.
   */
  myOrganizacoes$Response(params?: MyOrganizacoes$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return myOrganizacoes(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `myOrganizacoes$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  myOrganizacoes(params?: MyOrganizacoes$Params, context?: HttpContext): Observable<void> {
    return this.myOrganizacoes$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `searchOrganizacaoUsers()` */
  static readonly SearchOrganizacaoUsersPath = '/Organizacao/Users';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `searchOrganizacaoUsers()` instead.
   *
   * This method doesn't expect any request body.
   */
  searchOrganizacaoUsers$Response(params: SearchOrganizacaoUsers$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return searchOrganizacaoUsers(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `searchOrganizacaoUsers$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  searchUsers(params: SearchOrganizacaoUsers$Params, context?: HttpContext): Observable<void> {
    return this.searchOrganizacaoUsers$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `createOrganizacao()` */
  static readonly CreateOrganizacaoPath = '/Organizacao/Create';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `createOrganizacao()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  createOrganizacao$Response(params: CreateOrganizacao$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return createOrganizacao(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `createOrganizacao$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  create(params: CreateOrganizacao$Params, context?: HttpContext): Observable<void> {
    return this.createOrganizacao$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `getOrganizacaoDetails()` */
  static readonly GetOrganizacaoDetailsPath = '/Organizacao/{id}/Details';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getOrganizacaoDetails()` instead.
   *
   * This method doesn't expect any request body.
   */
  getOrganizacaoDetails$Response(params: GetOrganizacaoDetails$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return getOrganizacaoDetails(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getOrganizacaoDetails$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getDetails(params: GetOrganizacaoDetails$Params, context?: HttpContext): Observable<void> {
    return this.getOrganizacaoDetails$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `updateOrganizacao()` */
  static readonly UpdateOrganizacaoPath = '/Organizacao/{id}/Update';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `updateOrganizacao()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  updateOrganizacao$Response(params: UpdateOrganizacao$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return updateOrganizacao(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `updateOrganizacao$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  update(params: UpdateOrganizacao$Params, context?: HttpContext): Observable<void> {
    return this.updateOrganizacao$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `listOrganizacaoRoles()` */
  static readonly ListOrganizacaoRolesPath = '/Organizacao/{id}/Roles';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `listOrganizacaoRoles()` instead.
   *
   * This method doesn't expect any request body.
   */
  listOrganizacaoRoles$Response(params: ListOrganizacaoRoles$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return listOrganizacaoRoles(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `listOrganizacaoRoles$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  listRoles(params: ListOrganizacaoRoles$Params, context?: HttpContext): Observable<void> {
    return this.listOrganizacaoRoles$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `createOrganizacaoRole()` */
  static readonly CreateOrganizacaoRolePath = '/Organizacao/{id}/Roles';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `createOrganizacaoRole()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  createOrganizacaoRole$Response(params: CreateOrganizacaoRole$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return createOrganizacaoRole(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `createOrganizacaoRole$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  createRole(params: CreateOrganizacaoRole$Params, context?: HttpContext): Observable<void> {
    return this.createOrganizacaoRole$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `deleteOrganizacaoRole()` */
  static readonly DeleteOrganizacaoRolePath = '/Organizacao/{id}/Roles/{roleId}/Delete';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `deleteOrganizacaoRole()` instead.
   *
   * This method doesn't expect any request body.
   */
  deleteOrganizacaoRole$Response(params: DeleteOrganizacaoRole$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return deleteOrganizacaoRole(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `deleteOrganizacaoRole$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  deleteRole(params: DeleteOrganizacaoRole$Params, context?: HttpContext): Observable<void> {
    return this.deleteOrganizacaoRole$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `listOrganizacaoMembers()` */
  static readonly ListOrganizacaoMembersPath = '/Organizacao/{id}/Members';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `listOrganizacaoMembers()` instead.
   *
   * This method doesn't expect any request body.
   */
  listOrganizacaoMembers$Response(params: ListOrganizacaoMembers$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return listOrganizacaoMembers(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `listOrganizacaoMembers$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  listMembers(params: ListOrganizacaoMembers$Params, context?: HttpContext): Observable<void> {
    return this.listOrganizacaoMembers$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `shareOrganizacaoTenant()` */
  static readonly ShareOrganizacaoTenantPath = '/Organizacao/{id}/Share';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `shareOrganizacaoTenant()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  shareOrganizacaoTenant$Response(params: ShareOrganizacaoTenant$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return shareOrganizacaoTenant(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `shareOrganizacaoTenant$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  shareTenant(params: ShareOrganizacaoTenant$Params, context?: HttpContext): Observable<void> {
    return this.shareOrganizacaoTenant$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `assignOrganizacaoMemberRoles()` */
  static readonly AssignOrganizacaoMemberRolesPath = '/Organizacao/{id}/Members/{memberId}/Roles';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `assignOrganizacaoMemberRoles()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  assignOrganizacaoMemberRoles$Response(params: AssignOrganizacaoMemberRoles$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return assignOrganizacaoMemberRoles(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `assignOrganizacaoMemberRoles$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  assignMemberRoles(params: AssignOrganizacaoMemberRoles$Params, context?: HttpContext): Observable<void> {
    return this.assignOrganizacaoMemberRoles$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `removeOrganizacaoMember()` */
  static readonly RemoveOrganizacaoMemberPath = '/Organizacao/{id}/Members/{memberId}/Remove';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `removeOrganizacaoMember()` instead.
   *
   * This method doesn't expect any request body.
   */
  removeOrganizacaoMember$Response(params: RemoveOrganizacaoMember$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return removeOrganizacaoMember(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `removeOrganizacaoMember$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  removeMember(params: RemoveOrganizacaoMember$Params, context?: HttpContext): Observable<void> {
    return this.removeOrganizacaoMember$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

}
