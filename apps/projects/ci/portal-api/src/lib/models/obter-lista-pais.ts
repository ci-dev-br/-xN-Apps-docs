/* tslint:disable */
/* eslint-disable */
import { Pais } from './pais';
export interface ObterListaPais {
  skip?: number | null;
  take?: number | null;
  where?: Partial<Pais> | null;
  filter?: Partial<Pais> | null;
  search?: string | null;
  orderBy?: Record<string, 'ASC' | 'DESC'> | null;
}
