/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { CommentMeta } from '../../models/comment-meta';
import { ObterListaCommentMeta } from '../../models/obter-lista-comment-meta';

export interface GetListCommentMeta$Params {
      body: ObterListaCommentMeta
}

export function getListCommentMeta(http: HttpClient, rootUrl: string, params: GetListCommentMeta$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<CommentMeta>>> {
  const rb = new RequestBuilder(rootUrl, getListCommentMeta.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<CommentMeta>>;
    })
  );
}

getListCommentMeta.PATH = '/CommentMeta/GetList';
