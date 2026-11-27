/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { CommentMeta } from '../../models/comment-meta';

export interface DeleteCommentMeta$Params {
      body: CommentMeta
}

export function deleteCommentMeta(http: HttpClient, rootUrl: string, params: DeleteCommentMeta$Params, context?: HttpContext): Observable<StrictHttpResponse<CommentMeta>> {
  const rb = new RequestBuilder(rootUrl, deleteCommentMeta.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<CommentMeta>;
    })
  );
}

deleteCommentMeta.PATH = '/CommentMeta/Delete';
