/* tslint:disable */
/* eslint-disable */
export interface DashboardCmsContentItemDto {
  author: string;
  category: string;
  contentHtml?: string | null;
  excerpt: string;
  internalId: string;
  publishDate: string;
  publishedAt?: string | null;
  slug: string;
  sourceEntity: 'SitePost' | 'SitePage';
  status: 'publicado' | 'rascunho' | 'revisao' | 'agendado';
  tenantIds?: Array<string> | null;
  tenantNames?: Array<string> | null;
  title: string;
  type: 'post' | 'page' | 'notice';
  urlMatch?: string | null;
  views: number;
  websiteId?: string | null;
  websiteName?: string | null;
}
