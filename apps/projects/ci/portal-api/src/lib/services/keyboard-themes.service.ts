/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { KeyboardTheme } from '../models/keyboard-theme';
import { keyboardThemesControllerCreate } from '../fn/keyboard-themes/keyboard-themes-controller-create';
import { KeyboardThemesControllerCreate$Params } from '../fn/keyboard-themes/keyboard-themes-controller-create';
import { keyboardThemesControllerFindAll } from '../fn/keyboard-themes/keyboard-themes-controller-find-all';
import { KeyboardThemesControllerFindAll$Params } from '../fn/keyboard-themes/keyboard-themes-controller-find-all';
import { keyboardThemesControllerFindOne } from '../fn/keyboard-themes/keyboard-themes-controller-find-one';
import { KeyboardThemesControllerFindOne$Params } from '../fn/keyboard-themes/keyboard-themes-controller-find-one';
import { keyboardThemesControllerRemove } from '../fn/keyboard-themes/keyboard-themes-controller-remove';
import { KeyboardThemesControllerRemove$Params } from '../fn/keyboard-themes/keyboard-themes-controller-remove';

@Injectable()
export class KeyboardThemesService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `keyboardThemesControllerCreate()` */
  static readonly KeyboardThemesControllerCreatePath = '/keyboard-themes/create';

  /**
   * Cadastra um novo tema dinâmico para o teclado.
   *
   *
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `keyboardThemesControllerCreate()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  keyboardThemesControllerCreate$Response(params: KeyboardThemesControllerCreate$Params, context?: HttpContext): Observable<StrictHttpResponse<KeyboardTheme>> {
    return keyboardThemesControllerCreate(this.http, this.rootUrl, params, context);
  }

  /**
   * Cadastra um novo tema dinâmico para o teclado.
   *
   *
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `keyboardThemesControllerCreate$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  keyboardThemesControllerCreate(params: KeyboardThemesControllerCreate$Params, context?: HttpContext): Observable<KeyboardTheme> {
    return this.keyboardThemesControllerCreate$Response(params, context).pipe(
      map((r: StrictHttpResponse<KeyboardTheme>): KeyboardTheme => r.body)
    );
  }

  /** Path part for operation `keyboardThemesControllerFindAll()` */
  static readonly KeyboardThemesControllerFindAllPath = '/keyboard-themes/findAll';

  /**
   * Lista todos os temas de teclado cadastrados.
   *
   *
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `keyboardThemesControllerFindAll()` instead.
   *
   * This method doesn't expect any request body.
   */
  keyboardThemesControllerFindAll$Response(params?: KeyboardThemesControllerFindAll$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<KeyboardTheme>>> {
    return keyboardThemesControllerFindAll(this.http, this.rootUrl, params, context);
  }

  /**
   * Lista todos os temas de teclado cadastrados.
   *
   *
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `keyboardThemesControllerFindAll$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  keyboardThemesControllerFindAll(params?: KeyboardThemesControllerFindAll$Params, context?: HttpContext): Observable<Array<KeyboardTheme>> {
    return this.keyboardThemesControllerFindAll$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<KeyboardTheme>>): Array<KeyboardTheme> => r.body)
    );
  }

  /** Path part for operation `keyboardThemesControllerFindOne()` */
  static readonly KeyboardThemesControllerFindOnePath = '/keyboard-themes/{id}';

  /**
   * Busca um tema específico pelo ID.
   *
   *
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `keyboardThemesControllerFindOne()` instead.
   *
   * This method doesn't expect any request body.
   */
  keyboardThemesControllerFindOne$Response(params: KeyboardThemesControllerFindOne$Params, context?: HttpContext): Observable<StrictHttpResponse<KeyboardTheme>> {
    return keyboardThemesControllerFindOne(this.http, this.rootUrl, params, context);
  }

  /**
   * Busca um tema específico pelo ID.
   *
   *
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `keyboardThemesControllerFindOne$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  keyboardThemesControllerFindOne(params: KeyboardThemesControllerFindOne$Params, context?: HttpContext): Observable<KeyboardTheme> {
    return this.keyboardThemesControllerFindOne$Response(params, context).pipe(
      map((r: StrictHttpResponse<KeyboardTheme>): KeyboardTheme => r.body)
    );
  }

  /** Path part for operation `keyboardThemesControllerRemove()` */
  static readonly KeyboardThemesControllerRemovePath = '/keyboard-themes/{id}';

  /**
   * Remove um tema pelo ID.
   *
   *
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `keyboardThemesControllerRemove()` instead.
   *
   * This method doesn't expect any request body.
   */
  keyboardThemesControllerRemove$Response(params: KeyboardThemesControllerRemove$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return keyboardThemesControllerRemove(this.http, this.rootUrl, params, context);
  }

  /**
   * Remove um tema pelo ID.
   *
   *
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `keyboardThemesControllerRemove$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  keyboardThemesControllerRemove(params: KeyboardThemesControllerRemove$Params, context?: HttpContext): Observable<void> {
    return this.keyboardThemesControllerRemove$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

}
