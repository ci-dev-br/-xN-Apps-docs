/* tslint:disable */
/* eslint-disable */
import { AuthorDto } from '../models/author-dto';
export interface CommitDto {
  author: AuthorDto;
  branches: Array<string>;
  date: string;
  hash: string;
  message: string;
  parents: Array<string>;
  short_hash: string;
  short_parents: Array<string>;
}
