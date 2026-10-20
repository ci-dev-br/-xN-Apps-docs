/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { Application } from '../models/application';
import { canLoadApplication } from '../fn/application/can-load-application';
import { CanLoadApplication$Params } from '../fn/application/can-load-application';
import { catalogApplication } from '../fn/application/catalog-application';
import { CatalogApplication$Params } from '../fn/application/catalog-application';
import { checkVersionCataloged } from '../fn/application/check-version-cataloged';
import { CheckVersionCataloged$Params } from '../fn/application/check-version-cataloged';
import { deleteApplication } from '../fn/application/delete-application';
import { DeleteApplication$Params } from '../fn/application/delete-application';
import { getListApplication } from '../fn/application/get-list-application';
import { GetListApplication$Params } from '../fn/application/get-list-application';
import { getMyActivatedApplications } from '../fn/application/get-my-activated-applications';
import { GetMyActivatedApplications$Params } from '../fn/application/get-my-activated-applications';
import { getStoreApplications } from '../fn/application/get-store-applications';
import { GetStoreApplications$Params } from '../fn/application/get-store-applications';
import { installGitModuleApplication } from '../fn/application/install-git-module-application';
import { InstallGitModuleApplication$Params } from '../fn/application/install-git-module-application';
import { reconcileApplicationCatalog } from '../fn/application/reconcile-application-catalog';
import { ReconcileApplicationCatalog$Params } from '../fn/application/reconcile-application-catalog';
import { syncApplication } from '../fn/application/sync-application';
import { SyncApplication$Params } from '../fn/application/sync-application';
import { toggleApplicationActivation } from '../fn/application/toggle-application-activation';
import { ToggleApplicationActivation$Params } from '../fn/application/toggle-application-activation';
import { toggleGlobalApplicationStatus } from '../fn/application/toggle-global-application-status';
import { ToggleGlobalApplicationStatus$Params } from '../fn/application/toggle-global-application-status';

@Injectable()
export class ApplicationService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `getListApplication()` */
  static readonly GetListApplicationPath = '/Application/Get';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListApplication()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListApplication$Response(params: GetListApplication$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<Application>>> {
    return getListApplication(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListApplication$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListApplication$Params, context?: HttpContext): Observable<Array<Application>> {
    return this.getListApplication$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<Application>>): Array<Application> => r.body)
    );
  }

  /** Path part for operation `getStoreApplications()` */
  static readonly GetStoreApplicationsPath = '/Application/Store';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getStoreApplications()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getStoreApplications$Response(params: GetStoreApplications$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return getStoreApplications(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getStoreApplications$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getStores(params: GetStoreApplications$Params, context?: HttpContext): Observable<void> {
    return this.getStoreApplications$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `toggleApplicationActivation()` */
  static readonly ToggleApplicationActivationPath = '/Application/ToggleActivation';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `toggleApplicationActivation()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  toggleApplicationActivation$Response(params: ToggleApplicationActivation$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return toggleApplicationActivation(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `toggleApplicationActivation$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  toggleActivation(params: ToggleApplicationActivation$Params, context?: HttpContext): Observable<void> {
    return this.toggleApplicationActivation$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `getMyActivatedApplications()` */
  static readonly GetMyActivatedApplicationsPath = '/Application/MyActivations';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getMyActivatedApplications()` instead.
   *
   * This method doesn't expect any request body.
   */
  getMyActivatedApplications$Response(params?: GetMyActivatedApplications$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return getMyActivatedApplications(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getMyActivatedApplications$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getMyActivateds(params?: GetMyActivatedApplications$Params, context?: HttpContext): Observable<void> {
    return this.getMyActivatedApplications$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `toggleGlobalApplicationStatus()` */
  static readonly ToggleGlobalApplicationStatusPath = '/Application/ToggleGlobalStatus';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `toggleGlobalApplicationStatus()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  toggleGlobalApplicationStatus$Response(params: ToggleGlobalApplicationStatus$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return toggleGlobalApplicationStatus(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `toggleGlobalApplicationStatus$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  toggleGlobalStatus(params: ToggleGlobalApplicationStatus$Params, context?: HttpContext): Observable<void> {
    return this.toggleGlobalApplicationStatus$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `installGitModuleApplication()` */
  static readonly InstallGitModuleApplicationPath = '/Application/InstallGitModule';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `installGitModuleApplication()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  installGitModuleApplication$Response(params: InstallGitModuleApplication$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return installGitModuleApplication(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `installGitModuleApplication$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  installGitModule(params: InstallGitModuleApplication$Params, context?: HttpContext): Observable<void> {
    return this.installGitModuleApplication$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `checkVersionCataloged()` */
  static readonly CheckVersionCatalogedPath = '/Application/CheckVersion';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `checkVersionCataloged()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  checkVersionCataloged$Response(params: CheckVersionCataloged$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return checkVersionCataloged(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `checkVersionCataloged$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  checkVersionCataloged(params: CheckVersionCataloged$Params, context?: HttpContext): Observable<void> {
    return this.checkVersionCataloged$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `reconcileApplicationCatalog()` */
  static readonly ReconcileApplicationCatalogPath = '/Application/Reconcile';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `reconcileApplicationCatalog()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  reconcileApplicationCatalog$Response(params: ReconcileApplicationCatalog$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return reconcileApplicationCatalog(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `reconcileApplicationCatalog$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  reconcileCatalog(params: ReconcileApplicationCatalog$Params, context?: HttpContext): Observable<void> {
    return this.reconcileApplicationCatalog$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `catalogApplication()` */
  static readonly CatalogApplicationPath = '/Application/Catalog';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `catalogApplication()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  catalogApplication$Response(params: CatalogApplication$Params, context?: HttpContext): Observable<StrictHttpResponse<Application>> {
    return catalogApplication(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `catalogApplication$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  catalog(params: CatalogApplication$Params, context?: HttpContext): Observable<Application> {
    return this.catalogApplication$Response(params, context).pipe(
      map((r: StrictHttpResponse<Application>): Application => r.body)
    );
  }

  /** Path part for operation `canLoadApplication()` */
  static readonly CanLoadApplicationPath = '/Application/CanLoad';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `canLoadApplication()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  canLoadApplication$Response(params: CanLoadApplication$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return canLoadApplication(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `canLoadApplication$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  canLoad(params: CanLoadApplication$Params, context?: HttpContext): Observable<void> {
    return this.canLoadApplication$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `syncApplication()` */
  static readonly SyncApplicationPath = '/Application/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncApplication()` instead.
   *
   * This method doesn't expect any request body.
   */
  syncApplication$Response(params?: SyncApplication$Params, context?: HttpContext): Observable<StrictHttpResponse<Application>> {
    return syncApplication(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncApplication$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  sync(params?: SyncApplication$Params, context?: HttpContext): Observable<Application> {
    return this.syncApplication$Response(params, context).pipe(
      map((r: StrictHttpResponse<Application>): Application => r.body)
    );
  }

  /** Path part for operation `deleteApplication()` */
  static readonly DeleteApplicationPath = '/Application/Delete';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `deleteApplication()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  deleteApplication$Response(params: DeleteApplication$Params, context?: HttpContext): Observable<StrictHttpResponse<Application>> {
    return deleteApplication(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `deleteApplication$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  delete(params: DeleteApplication$Params, context?: HttpContext): Observable<Application> {
    return this.deleteApplication$Response(params, context).pipe(
      map((r: StrictHttpResponse<Application>): Application => r.body)
    );
  }

}
