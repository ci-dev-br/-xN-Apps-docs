/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { GetCommitsResponseDto } from '../../models/get-commits-response-dto';

export interface DeployerControllerGetCommits$Params {

/**
 * Quantidade de commits
 */
  limit?: number;

/**
 * Quantos commits pular (paginação)
 */
  skip?: number;

/**
 * Trazer histórico de todas as branches
 */
  all?: boolean;

/**
 * Filtrar por autor
 */
  author?: string;
}

export function deployerControllerGetCommits(http: HttpClient, rootUrl: string, params?: DeployerControllerGetCommits$Params, context?: HttpContext): Observable<StrictHttpResponse<GetCommitsResponseDto>> {
  const rb = new RequestBuilder(rootUrl, deployerControllerGetCommits.PATH, 'get');
  if (params) {
    rb.query('limit', params.limit, {});
    rb.query('skip', params.skip, {});
    rb.query('all', params.all, {});
    rb.query('author', params.author, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<GetCommitsResponseDto>;
    })
  );
}

deployerControllerGetCommits.PATH = '/Deployer/commits';
