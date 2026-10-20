/* tslint:disable */
/* eslint-disable */
import { User } from './user';

export interface NewsSocialStatus {
  tipo?: 'SELF' | 'CONHECIDO' | 'SEGUINDO' | 'SEGUIDOR' | 'NENHUM' | string;
  isFollowing?: boolean;
  isFollower?: boolean;
  isConhecido?: boolean;
}

export interface NewsCommentItem {
  id: string;
  newsId?: string;
  content: string;
  createdAt?: string | Date;
  user?: User | any;
  socialStatus?: NewsSocialStatus;
}
