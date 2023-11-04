/* tslint:disable */
/* eslint-disable */
import { User } from '../models/user';
export interface AcessoPayload {
  bearer?: string;
  chaveAcesso?: string;
  identificacao?: string;
  password?: string;
  refreshToken?: string;
  solicitarSessao?: string;
  user?: User;
}
