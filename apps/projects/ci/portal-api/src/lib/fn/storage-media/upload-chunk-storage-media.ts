/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { UploadChunkStorageMediaInputDto } from '../../models/upload-chunk-storage-media-input-dto';
import { UploadChunkStorageMediaOutputDto } from '../../models/upload-chunk-storage-media-output-dto';

export interface UploadChunkStorageMedia$Params {
      body: UploadChunkStorageMediaInputDto
}

export function uploadChunkStorageMedia(http: HttpClient, rootUrl: string, params: UploadChunkStorageMedia$Params, context?: HttpContext): Observable<StrictHttpResponse<UploadChunkStorageMediaOutputDto>> {
  const rb = new RequestBuilder(rootUrl, uploadChunkStorageMedia.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<UploadChunkStorageMediaOutputDto>;
    })
  );
}

uploadChunkStorageMedia.PATH = '/StorageMedia/UploadChunk';
