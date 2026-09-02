/* tslint:disable */
/* eslint-disable */
import { PostDto } from '../models/post-dto';
export interface FeedColumnDto {
  mainSource: string;
  posts: Array<PostDto>;
}
