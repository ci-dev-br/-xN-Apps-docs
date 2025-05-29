 /* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { videoControllerGet } from '../fn/video/video-controller-get';
import { VideoControllerGet$Params } from '../fn/video/video-controller-get';

@Injectable()
export class VideoService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `videoControllerGet()` */
  static readonly VideoControllerGetPath = '/Video/Get';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `videoControllerGet()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  videoControllerGet$Response(params: VideoControllerGet$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return videoControllerGet(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `videoControllerGet$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  videoControllerGet(params: VideoControllerGet$Params, context?: HttpContext): Observable<void> {
    return this.videoControllerGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

}
