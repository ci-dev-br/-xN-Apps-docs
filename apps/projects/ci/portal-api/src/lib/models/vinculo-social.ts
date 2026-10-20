/* tslint:disable */
/* eslint-disable */
import { User } from '../models/user';
export interface VinculoSocial {
  atualizadoEm: string;
  criadoEm: string;
  id: string;
  seguido: User;
  seguidor: User;
  tipo: 'SEGUIDOR' | 'CONHECIDO';
}
