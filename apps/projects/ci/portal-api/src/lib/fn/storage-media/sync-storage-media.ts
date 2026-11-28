/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { StorageAsset } from '../../models/storage-asset';
import { SyncPayloadDaoStorageAsset } from '../../models/sync-payload-dao-storage-asset';

export interface SyncStorageMedia$Params {
      body: SyncPayloadDaoStorageAsset
}

export function syncStorageMedia(http: HttpClient, rootUrl: string, params: SyncStorageMedia$Params, context?: HttpContext): Observable<StrictHttpResponse<StorageAsset>> {
  const rb = new RequestBuilder(rootUrl, syncStorageMedia.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<StorageAsset>;
    })
  );
}

syncStorageMedia.PATH = '/StorageMedia/Sync';
