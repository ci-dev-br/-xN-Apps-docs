/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { CommentMeta } from '../../models/comment-meta';
import { SyncPayloadDaoCommentMeta } from '../../models/sync-payload-dao-comment-meta';

export interface SyncCommentMeta$Params {
      body: SyncPayloadDaoCommentMeta
}

export function syncCommentMeta(http: HttpClient, rootUrl: string, params: SyncCommentMeta$Params, context?: HttpContext): Observable<StrictHttpResponse<CommentMeta>> {
  const rb = new RequestBuilder(rootUrl, syncCommentMeta.PATH, 'post');
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

syncCommentMeta.PATH = '/CommentMeta/Sync';
