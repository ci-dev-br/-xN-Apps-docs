/* tslint:disable */
/* eslint-disable */
import { Category } from '../models/category';
export interface ObterListaCategory {
  filter?: Category | null;
  orderBy?: {
} | null;
  search?: string | null;
  skip?: number | null;
  take?: number | null;
  where?: Category | null;
}
