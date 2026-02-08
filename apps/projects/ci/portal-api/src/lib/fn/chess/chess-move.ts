/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { GamePayload } from '../../models/game-payload';

export interface ChessMove$Params {
      body: GamePayload
}

export function chessMove(http: HttpClient, rootUrl: string, params: ChessMove$Params, context?: HttpContext): Observable<StrictHttpResponse<GamePayload>> {
  const rb = new RequestBuilder(rootUrl, chessMove.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<GamePayload>;
    })
  );
}

chessMove.PATH = '/Chess/ChessMove';
