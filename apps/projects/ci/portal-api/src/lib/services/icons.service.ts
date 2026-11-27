/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { deleteIconIcons } from '../fn/icons/delete-icon-icons';
import { DeleteIconIcons$Params } from '../fn/icons/delete-icon-icons';
import { getIcons } from '../fn/icons/get-icons';
import { GetIcons$Params } from '../fn/icons/get-icons';
import { getManifestIcons } from '../fn/icons/get-manifest-icons';
import { GetManifestIcons$Params } from '../fn/icons/get-manifest-icons';
import { getWorkspacePacksIcons } from '../fn/icons/get-workspace-packs-icons';
import { GetWorkspacePacksIcons$Params } from '../fn/icons/get-workspace-packs-icons';
import { Icon } from '../models/icon';
import { IconManifestResponseDto } from '../models/icon-manifest-response-dto';
import { linkTargetsIcons } from '../fn/icons/link-targets-icons';
import { LinkTargetsIcons$Params } from '../fn/icons/link-targets-icons';
import { registryIcons } from '../fn/icons/registry-icons';
import { RegistryIcons$Params } from '../fn/icons/registry-icons';
import { saveIconIcons } from '../fn/icons/save-icon-icons';
import { SaveIconIcons$Params } from '../fn/icons/save-icon-icons';
import { savePackIcons } from '../fn/icons/save-pack-icons';
import { SavePackIcons$Params } from '../fn/icons/save-pack-icons';
import { WorkspaceIconItemDto } from '../models/workspace-icon-item-dto';
import { WorkspaceIconPackDto } from '../models/workspace-icon-pack-dto';
import { WorkspacePacksResponseDto } from '../models/workspace-packs-response-dto';

@Injectable()
export class IconsService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `registryIcons()` */
  static readonly RegistryIconsPath = '/Icons/Registry';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `registryIcons()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  registryIcons$Response(params: RegistryIcons$Params, context?: HttpContext): Observable<StrictHttpResponse<WorkspaceIconItemDto>> {
    return registryIcons(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `registryIcons$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  registry(params: RegistryIcons$Params, context?: HttpContext): Observable<WorkspaceIconItemDto> {
    return this.registryIcons$Response(params, context).pipe(
      map((r: StrictHttpResponse<WorkspaceIconItemDto>): WorkspaceIconItemDto => r.body)
    );
  }

  /** Path part for operation `getIcons()` */
  static readonly GetIconsPath = '/Icons/Get';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getIcons()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getIcons$Response(params: GetIcons$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<Icon>>> {
    return getIcons(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getIcons$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  get(params: GetIcons$Params, context?: HttpContext): Observable<Array<Icon>> {
    return this.getIcons$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<Icon>>): Array<Icon> => r.body)
    );
  }

  /** Path part for operation `getWorkspacePacksIcons()` */
  static readonly GetWorkspacePacksIconsPath = '/Icons/WorkspacePacks';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getWorkspacePacksIcons()` instead.
   *
   * This method doesn't expect any request body.
   */
  getWorkspacePacksIcons$Response(params?: GetWorkspacePacksIcons$Params, context?: HttpContext): Observable<StrictHttpResponse<WorkspacePacksResponseDto>> {
    return getWorkspacePacksIcons(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getWorkspacePacksIcons$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getWorkspacePacks(params?: GetWorkspacePacksIcons$Params, context?: HttpContext): Observable<WorkspacePacksResponseDto> {
    return this.getWorkspacePacksIcons$Response(params, context).pipe(
      map((r: StrictHttpResponse<WorkspacePacksResponseDto>): WorkspacePacksResponseDto => r.body)
    );
  }

  /** Path part for operation `savePackIcons()` */
  static readonly SavePackIconsPath = '/Icons/SavePack';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `savePackIcons()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  savePackIcons$Response(params: SavePackIcons$Params, context?: HttpContext): Observable<StrictHttpResponse<WorkspaceIconPackDto>> {
    return savePackIcons(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `savePackIcons$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  savePack(params: SavePackIcons$Params, context?: HttpContext): Observable<WorkspaceIconPackDto> {
    return this.savePackIcons$Response(params, context).pipe(
      map((r: StrictHttpResponse<WorkspaceIconPackDto>): WorkspaceIconPackDto => r.body)
    );
  }

  /** Path part for operation `saveIconIcons()` */
  static readonly SaveIconIconsPath = '/Icons/SaveIcon';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `saveIconIcons()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  saveIconIcons$Response(params: SaveIconIcons$Params, context?: HttpContext): Observable<StrictHttpResponse<WorkspaceIconItemDto>> {
    return saveIconIcons(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `saveIconIcons$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  saveIcon(params: SaveIconIcons$Params, context?: HttpContext): Observable<WorkspaceIconItemDto> {
    return this.saveIconIcons$Response(params, context).pipe(
      map((r: StrictHttpResponse<WorkspaceIconItemDto>): WorkspaceIconItemDto => r.body)
    );
  }

  /** Path part for operation `deleteIconIcons()` */
  static readonly DeleteIconIconsPath = '/Icons/DeleteIcon';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `deleteIconIcons()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  deleteIconIcons$Response(params: DeleteIconIcons$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return deleteIconIcons(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `deleteIconIcons$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  deleteIcon(params: DeleteIconIcons$Params, context?: HttpContext): Observable<void> {
    return this.deleteIconIcons$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `linkTargetsIcons()` */
  static readonly LinkTargetsIconsPath = '/Icons/LinkTargets';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `linkTargetsIcons()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  linkTargetsIcons$Response(params: LinkTargetsIcons$Params, context?: HttpContext): Observable<StrictHttpResponse<WorkspaceIconItemDto>> {
    return linkTargetsIcons(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `linkTargetsIcons$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  linkTargets(params: LinkTargetsIcons$Params, context?: HttpContext): Observable<WorkspaceIconItemDto> {
    return this.linkTargetsIcons$Response(params, context).pipe(
      map((r: StrictHttpResponse<WorkspaceIconItemDto>): WorkspaceIconItemDto => r.body)
    );
  }

  /** Path part for operation `getManifestIcons()` */
  static readonly GetManifestIconsPath = '/Icons/Manifest';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getManifestIcons()` instead.
   *
   * This method doesn't expect any request body.
   */
  getManifestIcons$Response(params?: GetManifestIcons$Params, context?: HttpContext): Observable<StrictHttpResponse<IconManifestResponseDto>> {
    return getManifestIcons(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getManifestIcons$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getManifest(params?: GetManifestIcons$Params, context?: HttpContext): Observable<IconManifestResponseDto> {
    return this.getManifestIcons$Response(params, context).pipe(
      map((r: StrictHttpResponse<IconManifestResponseDto>): IconManifestResponseDto => r.body)
    );
  }

}
