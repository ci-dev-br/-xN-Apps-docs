/* tslint:disable */
/* eslint-disable */
import { CommitDto } from '../models/commit-dto';
export interface GetCommitsResponseDto {
  commits: Array<CommitDto>;
  parametros: {
};
  total_retornado: number;
}
