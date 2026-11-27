/* tslint:disable */
/* eslint-disable */
import { Comment } from '../models/comment';
import { DashboardCmsContentItemDto } from '../models/dashboard-cms-content-item-dto';
import { DashboardCmsKpisDto } from '../models/dashboard-cms-kpis-dto';
import { SiteMedia } from '../models/site-media';
import { Term } from '../models/term';
import { Website } from '../models/website';
export interface DashboardCmsDto {
  contents: Array<DashboardCmsContentItemDto>;
  kpis: DashboardCmsKpisDto;
  recentComments: Array<Comment>;
  recentMedia: Array<SiteMedia>;
  terms: Array<Term>;
  websites: Array<Website>;
}
