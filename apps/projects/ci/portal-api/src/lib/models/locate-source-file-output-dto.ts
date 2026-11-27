/* tslint:disable */
/* eslint-disable */
import { LocatedSourceFileDto } from '../models/located-source-file-dto';
export interface LocateSourceFileOutputDto {
  files: Array<LocatedSourceFileDto>;
  found: boolean;
  primaryFile?: LocatedSourceFileDto | null;
  query: string;
  total: number;
}
