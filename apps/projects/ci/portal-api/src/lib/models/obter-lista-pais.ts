/* tslint:disable */
/* eslint-disable */
import { Pais } from '../models/pais';
export interface ObterListaPais {
  filter?: Pais | null;
  orderBy?: {
} | null;
  search?: string | null;
  skip?: number | null;
  take?: number | null;
  where?: Pais | null;
}
