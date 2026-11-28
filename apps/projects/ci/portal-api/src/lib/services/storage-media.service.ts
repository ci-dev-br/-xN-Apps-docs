/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { completeUploadStorageMedia } from '../fn/storage-media/complete-upload-storage-media';
import { CompleteUploadStorageMedia$Params } from '../fn/storage-media/complete-upload-storage-media';
import { deleteStorageMedia } from '../fn/storage-media/delete-storage-media';
import { DeleteStorageMedia$Params } from '../fn/storage-media/delete-storage-media';
import { getAssetInfoStorageMedia } from '../fn/storage-media/get-asset-info-storage-media';
import { GetAssetInfoStorageMedia$Params } from '../fn/storage-media/get-asset-info-storage-media';
import { getByInternalIdStorageMedia } from '../fn/storage-media/get-by-internal-id-storage-media';
import { GetByInternalIdStorageMedia$Params } from '../fn/storage-media/get-by-internal-id-storage-media';
import { getListStorageMedia } from '../fn/storage-media/get-list-storage-media';
import { GetListStorageMedia$Params } from '../fn/storage-media/get-list-storage-media';
import { initUploadStorageMedia } from '../fn/storage-media/init-upload-storage-media';
import { InitUploadStorageMedia$Params } from '../fn/storage-media/init-upload-storage-media';
import { InitUploadStorageMediaOutputDto } from '../models/init-upload-storage-media-output-dto';
import { readChunkStorageMedia } from '../fn/storage-media/read-chunk-storage-media';
import { ReadChunkStorageMedia$Params } from '../fn/storage-media/read-chunk-storage-media';
import { ReadChunkStorageMediaOutputDto } from '../models/read-chunk-storage-media-output-dto';
import { StorageAsset } from '../models/storage-asset';
import { syncStorageMedia } from '../fn/storage-media/sync-storage-media';
import { SyncStorageMedia$Params } from '../fn/storage-media/sync-storage-media';
import { uploadChunkStorageMedia } from '../fn/storage-media/upload-chunk-storage-media';
import { UploadChunkStorageMedia$Params } from '../fn/storage-media/upload-chunk-storage-media';
import { UploadChunkStorageMediaOutputDto } from '../models/upload-chunk-storage-media-output-dto';

@Injectable()
export class StorageMediaService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncStorageMedia()` */
  static readonly SyncStorageMediaPath = '/StorageMedia/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncStorageMedia()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncStorageMedia$Response(params: SyncStorageMedia$Params, context?: HttpContext): Observable<StrictHttpResponse<StorageAsset>> {
    return syncStorageMedia(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncStorageMedia$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncStorageMedia$Params, context?: HttpContext): Observable<StorageAsset> {
    return this.syncStorageMedia$Response(params, context).pipe(
      map((r: StrictHttpResponse<StorageAsset>): StorageAsset => r.body)
    );
  }

  /** Path part for operation `getByInternalIdStorageMedia()` */
  static readonly GetByInternalIdStorageMediaPath = '/StorageMedia/GetByInternalId';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getByInternalIdStorageMedia()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalIdStorageMedia$Response(params: GetByInternalIdStorageMedia$Params, context?: HttpContext): Observable<StrictHttpResponse<StorageAsset>> {
    return getByInternalIdStorageMedia(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getByInternalIdStorageMedia$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalId(params: GetByInternalIdStorageMedia$Params, context?: HttpContext): Observable<StorageAsset> {
    return this.getByInternalIdStorageMedia$Response(params, context).pipe(
      map((r: StrictHttpResponse<StorageAsset>): StorageAsset => r.body)
    );
  }

  /** Path part for operation `getListStorageMedia()` */
  static readonly GetListStorageMediaPath = '/StorageMedia/GetList';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListStorageMedia()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListStorageMedia$Response(params: GetListStorageMedia$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<StorageAsset>>> {
    return getListStorageMedia(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListStorageMedia$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListStorageMedia$Params, context?: HttpContext): Observable<Array<StorageAsset>> {
    return this.getListStorageMedia$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<StorageAsset>>): Array<StorageAsset> => r.body)
    );
  }

  /** Path part for operation `deleteStorageMedia()` */
  static readonly DeleteStorageMediaPath = '/StorageMedia/Delete';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `deleteStorageMedia()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  deleteStorageMedia$Response(params: DeleteStorageMedia$Params, context?: HttpContext): Observable<StrictHttpResponse<StorageAsset>> {
    return deleteStorageMedia(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `deleteStorageMedia$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  delete(params: DeleteStorageMedia$Params, context?: HttpContext): Observable<StorageAsset> {
    return this.deleteStorageMedia$Response(params, context).pipe(
      map((r: StrictHttpResponse<StorageAsset>): StorageAsset => r.body)
    );
  }

  /** Path part for operation `initUploadStorageMedia()` */
  static readonly InitUploadStorageMediaPath = '/StorageMedia/InitUpload';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `initUploadStorageMedia()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  initUploadStorageMedia$Response(params: InitUploadStorageMedia$Params, context?: HttpContext): Observable<StrictHttpResponse<InitUploadStorageMediaOutputDto>> {
    return initUploadStorageMedia(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `initUploadStorageMedia$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  initUpload(params: InitUploadStorageMedia$Params, context?: HttpContext): Observable<InitUploadStorageMediaOutputDto> {
    return this.initUploadStorageMedia$Response(params, context).pipe(
      map((r: StrictHttpResponse<InitUploadStorageMediaOutputDto>): InitUploadStorageMediaOutputDto => r.body)
    );
  }

  /** Path part for operation `uploadChunkStorageMedia()` */
  static readonly UploadChunkStorageMediaPath = '/StorageMedia/UploadChunk';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `uploadChunkStorageMedia()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  uploadChunkStorageMedia$Response(params: UploadChunkStorageMedia$Params, context?: HttpContext): Observable<StrictHttpResponse<UploadChunkStorageMediaOutputDto>> {
    return uploadChunkStorageMedia(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `uploadChunkStorageMedia$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  uploadChunk(params: UploadChunkStorageMedia$Params, context?: HttpContext): Observable<UploadChunkStorageMediaOutputDto> {
    return this.uploadChunkStorageMedia$Response(params, context).pipe(
      map((r: StrictHttpResponse<UploadChunkStorageMediaOutputDto>): UploadChunkStorageMediaOutputDto => r.body)
    );
  }

  /** Path part for operation `completeUploadStorageMedia()` */
  static readonly CompleteUploadStorageMediaPath = '/StorageMedia/CompleteUpload';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `completeUploadStorageMedia()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  completeUploadStorageMedia$Response(params: CompleteUploadStorageMedia$Params, context?: HttpContext): Observable<StrictHttpResponse<StorageAsset>> {
    return completeUploadStorageMedia(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `completeUploadStorageMedia$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  completeUpload(params: CompleteUploadStorageMedia$Params, context?: HttpContext): Observable<StorageAsset> {
    return this.completeUploadStorageMedia$Response(params, context).pipe(
      map((r: StrictHttpResponse<StorageAsset>): StorageAsset => r.body)
    );
  }

  /** Path part for operation `getAssetInfoStorageMedia()` */
  static readonly GetAssetInfoStorageMediaPath = '/StorageMedia/GetAssetInfo';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getAssetInfoStorageMedia()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getAssetInfoStorageMedia$Response(params: GetAssetInfoStorageMedia$Params, context?: HttpContext): Observable<StrictHttpResponse<StorageAsset>> {
    return getAssetInfoStorageMedia(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getAssetInfoStorageMedia$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getAssetInfo(params: GetAssetInfoStorageMedia$Params, context?: HttpContext): Observable<StorageAsset> {
    return this.getAssetInfoStorageMedia$Response(params, context).pipe(
      map((r: StrictHttpResponse<StorageAsset>): StorageAsset => r.body)
    );
  }

  /** Path part for operation `readChunkStorageMedia()` */
  static readonly ReadChunkStorageMediaPath = '/StorageMedia/ReadChunk';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `readChunkStorageMedia()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  readChunkStorageMedia$Response(params: ReadChunkStorageMedia$Params, context?: HttpContext): Observable<StrictHttpResponse<ReadChunkStorageMediaOutputDto>> {
    return readChunkStorageMedia(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `readChunkStorageMedia$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  readChunk(params: ReadChunkStorageMedia$Params, context?: HttpContext): Observable<ReadChunkStorageMediaOutputDto> {
    return this.readChunkStorageMedia$Response(params, context).pipe(
      map((r: StrictHttpResponse<ReadChunkStorageMediaOutputDto>): ReadChunkStorageMediaOutputDto => r.body)
    );
  }

}
