/* tslint:disable */
/* eslint-disable */
import { User } from '../models/user';
export interface AcessoPayload {
  bearer?: string | null;
  chaveAcesso?: string | null;
  identificacao?: string | null;
  mode?: string | null;
  password?: string | null;
  refreshToken?: string | null;
  solicitarSessao?: string | null;
  user?: User | null;
}
