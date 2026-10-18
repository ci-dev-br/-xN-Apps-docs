/* tslint:disable */
/* eslint-disable */
import { UnidadeMedida } from './unidade-medida';
export interface ObterListaUnidadeMedida {
  skip?: number | null;
  take?: number | null;
  where?: Partial<UnidadeMedida> | null;
  filter?: Partial<UnidadeMedida> | null;
  search?: string | null;
  orderBy?: Record<string, 'ASC' | 'DESC'> | null;
}
