/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { getInstalledPackages } from '../fn/codex/get-installed-packages';
import { GetInstalledPackages$Params } from '../fn/codex/get-installed-packages';
import { getPackageDocumentation } from '../fn/codex/get-package-documentation';
import { GetPackageDocumentation$Params } from '../fn/codex/get-package-documentation';
import { getTypeScriptDocumentation } from '../fn/codex/get-type-script-documentation';
import { GetTypeScriptDocumentation$Params } from '../fn/codex/get-type-script-documentation';
import { getTypeScriptResources } from '../fn/codex/get-type-script-resources';
import { GetTypeScriptResources$Params } from '../fn/codex/get-type-script-resources';
import { resolveTypeScriptDefinition } from '../fn/codex/resolve-type-script-definition';
import { ResolveTypeScriptDefinition$Params } from '../fn/codex/resolve-type-script-definition';
import { TypeScriptDefinitionOutputDto } from '../models/type-script-definition-output-dto';
import { TypeScriptDocumentationOutputDto } from '../models/type-script-documentation-output-dto';
import { TypeScriptInstalledPackagesOutputDto } from '../models/type-script-installed-packages-output-dto';
import { TypeScriptPackageDocOutputDto } from '../models/type-script-package-doc-output-dto';
import { TypeScriptResourcesOutputDto } from '../models/type-script-resources-output-dto';

@Injectable()
export class CodexService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `getTypeScriptResources()` */
  static readonly GetTypeScriptResourcesPath = '/Codex/typescript/resources';

  /**
   * Carrega recursos avançados de TypeScript para o Monaco Editor.
   *
   *
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getTypeScriptResources()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getTypeScriptResources$Response(params: GetTypeScriptResources$Params, context?: HttpContext): Observable<StrictHttpResponse<TypeScriptResourcesOutputDto>> {
    return getTypeScriptResources(this.http, this.rootUrl, params, context);
  }

  /**
   * Carrega recursos avançados de TypeScript para o Monaco Editor.
   *
   *
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getTypeScriptResources$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getTypeScriptResources(params: GetTypeScriptResources$Params, context?: HttpContext): Observable<TypeScriptResourcesOutputDto> {
    return this.getTypeScriptResources$Response(params, context).pipe(
      map((r: StrictHttpResponse<TypeScriptResourcesOutputDto>): TypeScriptResourcesOutputDto => r.body)
    );
  }

  /** Path part for operation `resolveTypeScriptDefinition()` */
  static readonly ResolveTypeScriptDefinitionPath = '/Codex/typescript/definition';

  /**
   * Resolve a definição de um símbolo (Go to Definition, F12, Ctrl+Click).
   *
   *
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `resolveTypeScriptDefinition()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  resolveTypeScriptDefinition$Response(params: ResolveTypeScriptDefinition$Params, context?: HttpContext): Observable<StrictHttpResponse<TypeScriptDefinitionOutputDto>> {
    return resolveTypeScriptDefinition(this.http, this.rootUrl, params, context);
  }

  /**
   * Resolve a definição de um símbolo (Go to Definition, F12, Ctrl+Click).
   *
   *
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `resolveTypeScriptDefinition$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  resolveTypeScriptDefinition(params: ResolveTypeScriptDefinition$Params, context?: HttpContext): Observable<TypeScriptDefinitionOutputDto> {
    return this.resolveTypeScriptDefinition$Response(params, context).pipe(
      map((r: StrictHttpResponse<TypeScriptDefinitionOutputDto>): TypeScriptDefinitionOutputDto => r.body)
    );
  }

  /** Path part for operation `getTypeScriptDocumentation()` */
  static readonly GetTypeScriptDocumentationPath = '/Codex/typescript/documentation';

  /**
   * Extrai a documentação e comentários JSDoc de um símbolo ou módulo.
   *
   *
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getTypeScriptDocumentation()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getTypeScriptDocumentation$Response(params: GetTypeScriptDocumentation$Params, context?: HttpContext): Observable<StrictHttpResponse<TypeScriptDocumentationOutputDto>> {
    return getTypeScriptDocumentation(this.http, this.rootUrl, params, context);
  }

  /**
   * Extrai a documentação e comentários JSDoc de um símbolo ou módulo.
   *
   *
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getTypeScriptDocumentation$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getTypeScriptDocumentation(params: GetTypeScriptDocumentation$Params, context?: HttpContext): Observable<TypeScriptDocumentationOutputDto> {
    return this.getTypeScriptDocumentation$Response(params, context).pipe(
      map((r: StrictHttpResponse<TypeScriptDocumentationOutputDto>): TypeScriptDocumentationOutputDto => r.body)
    );
  }

  /** Path part for operation `getPackageDocumentation()` */
  static readonly GetPackageDocumentationPath = '/Codex/typescript/package-doc';

  /**
   * Obtém documentação completa de um módulo/pacote instalado em node_modules.
   *
   *
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getPackageDocumentation()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getPackageDocumentation$Response(params: GetPackageDocumentation$Params, context?: HttpContext): Observable<StrictHttpResponse<TypeScriptPackageDocOutputDto>> {
    return getPackageDocumentation(this.http, this.rootUrl, params, context);
  }

  /**
   * Obtém documentação completa de um módulo/pacote instalado em node_modules.
   *
   *
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getPackageDocumentation$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getPackageDocumentation(params: GetPackageDocumentation$Params, context?: HttpContext): Observable<TypeScriptPackageDocOutputDto> {
    return this.getPackageDocumentation$Response(params, context).pipe(
      map((r: StrictHttpResponse<TypeScriptPackageDocOutputDto>): TypeScriptPackageDocOutputDto => r.body)
    );
  }

  /** Path part for operation `getInstalledPackages()` */
  static readonly GetInstalledPackagesPath = '/Codex/typescript/installed-packages';

  /**
   * Lista pacotes instalados e módulos utilizados no arquivo ativo.
   *
   *
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getInstalledPackages()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getInstalledPackages$Response(params: GetInstalledPackages$Params, context?: HttpContext): Observable<StrictHttpResponse<TypeScriptInstalledPackagesOutputDto>> {
    return getInstalledPackages(this.http, this.rootUrl, params, context);
  }

  /**
   * Lista pacotes instalados e módulos utilizados no arquivo ativo.
   *
   *
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getInstalledPackages$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getInstalledPackages(params: GetInstalledPackages$Params, context?: HttpContext): Observable<TypeScriptInstalledPackagesOutputDto> {
    return this.getInstalledPackages$Response(params, context).pipe(
      map((r: StrictHttpResponse<TypeScriptInstalledPackagesOutputDto>): TypeScriptInstalledPackagesOutputDto => r.body)
    );
  }

}
