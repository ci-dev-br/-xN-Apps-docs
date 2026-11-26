/* tslint:disable */
/* eslint-disable */
import { UnidadeMedida } from '../models/unidade-medida';
export interface ObterListaUnidadeMedida {
  filter?: UnidadeMedida | null;
  orderBy?: {
} | null;
  search?: string | null;
  skip?: number | null;
  take?: number | null;
  where?: UnidadeMedida | null;
}
