/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ReadChunkStorageMediaInputDto } from '../../models/read-chunk-storage-media-input-dto';
import { ReadChunkStorageMediaOutputDto } from '../../models/read-chunk-storage-media-output-dto';

export interface ReadChunkStorageMedia$Params {
      body: ReadChunkStorageMediaInputDto
}

export function readChunkStorageMedia(http: HttpClient, rootUrl: string, params: ReadChunkStorageMedia$Params, context?: HttpContext): Observable<StrictHttpResponse<ReadChunkStorageMediaOutputDto>> {
  const rb = new RequestBuilder(rootUrl, readChunkStorageMedia.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<ReadChunkStorageMediaOutputDto>;
    })
  );
}

readChunkStorageMedia.PATH = '/StorageMedia/ReadChunk';
