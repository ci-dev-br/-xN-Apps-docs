/* tslint:disable */
/* eslint-disable */
import { ReaderNewsDigestItemDto } from '../models/reader-news-digest-item-dto';
export interface ReaderNewsClusterDto {
  clusterId: string;
  items: Array<ReaderNewsDigestItemDto>;
  keywords: Array<string>;
  latestPublishedAt: string;
  newsCount: number;
  oldestPublishedAt: string;

  /**
   * Tema representativo do agrupamento por similaridade
   */
  topic: string;
  totalLikes: number;
}
