/* tslint:disable */
/* eslint-disable */
import { Category } from './category';
export interface ObterListaCategory {
  skip?: number | null;
  take?: number | null;
  where?: Partial<Category> | null;
  filter?: Partial<Category> | null;
  search?: string | null;
  orderBy?: Record<string, 'ASC' | 'DESC'> | null;
}
