/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { BlockSnapshotDto } from '../../models/block-snapshot-dto';
import { GetByInternalIdInputDto } from '../../models/get-by-internal-id-input-dto';

export interface GetSnapshotsBlock$Params {
      body: GetByInternalIdInputDto
}

export function getSnapshotsBlock(http: HttpClient, rootUrl: string, params: GetSnapshotsBlock$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<BlockSnapshotDto>>> {
  const rb = new RequestBuilder(rootUrl, getSnapshotsBlock.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<BlockSnapshotDto>>;
    })
  );
}

getSnapshotsBlock.PATH = '/Block/GetSnapshots';
