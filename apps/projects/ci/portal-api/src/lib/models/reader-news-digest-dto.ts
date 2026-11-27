/* tslint:disable */
/* eslint-disable */
import { ReaderNewsClusterDto } from '../models/reader-news-cluster-dto';
export interface ReaderNewsDigestDto {
  digestId: string;
  generatedAt: string;
  groups: Array<ReaderNewsClusterDto>;
  notifiedReadersCount: number;
  targetRole: string;
  totalClusters: number;
  totalNews: number;
  windowHours: number;
}
