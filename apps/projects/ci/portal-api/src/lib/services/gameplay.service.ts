/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { createNewGameplay } from '../fn/gameplay/create-new-gameplay';
import { CreateNewGameplay$Params } from '../fn/gameplay/create-new-gameplay';
import { getGamePlayByUser } from '../fn/gameplay/get-game-play-by-user';
import { GetGamePlayByUser$Params } from '../fn/gameplay/get-game-play-by-user';

@Injectable()
export class GameplayService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `createNewGameplay()` */
  static readonly CreateNewGameplayPath = '/Gameplay/CreateNewGameplay';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `createNewGameplay()` instead.
   *
   * This method doesn't expect any request body.
   */
  createNewGameplay$Response(params?: CreateNewGameplay$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return createNewGameplay(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `createNewGameplay$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  createNew(params?: CreateNewGameplay$Params, context?: HttpContext): Observable<void> {
    return this.createNewGameplay$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `getGamePlayByUser()` */
  static readonly GetGamePlayByUserPath = '/Gameplay/GetGamePlayByUser';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getGamePlayByUser()` instead.
   *
   * This method doesn't expect any request body.
   */
  getGamePlayByUser$Response(params?: GetGamePlayByUser$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return getGamePlayByUser(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getGamePlayByUser$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getGamePlayByUser(params?: GetGamePlayByUser$Params, context?: HttpContext): Observable<void> {
    return this.getGamePlayByUser$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

}
